import { StatusCodes } from 'http-status-codes';
import { Document } from 'mongoose';
import { singleton } from 'tsyringe';
import { Comment, CommentDocument, ICreateComment } from '../../models/comment';
import { HttpException } from '../../models/http-exception';
import { Metrics } from '../../models/metrics';
import { ICreatePost, IPost, Post } from '../../models/post';
import { NonStrictObjectId } from '../../utils/objectid';
import { UserService } from '../user-service';
import { AlgoSuggestion, IAlgoSuggestionOther } from '../../models/algo/algo-suggestion';

@singleton()
export class PostService {
    constructor(private readonly userService: UserService) {}

    async publishPost(userId: NonStrictObjectId, newPost: ICreatePost): Promise<Document & IPost> {
        await this.userService.getUser(userId);

        const metrics = new Metrics({});
        await metrics.save();

        let post = new Post({
            text: newPost.text,
            image: newPost.image,
            createdBy: userId,
            metrics: metrics._id,
        });

        post = await post.save();

        await this.userService.addPostId(userId, post._id);

        return post;
    }

    async publishComment(userId: NonStrictObjectId, newComment: ICreateComment): Promise<Document & IPost> {
        await this.userService.getUser(userId);
        const post = await this.getPost(newComment.parentPostId.toString());

        const metrics = new Metrics({});
        await metrics.save();

        const comment = new Comment({
            text: newComment.text,
            image: newComment.image,
            createdBy: userId,
            metrics: metrics._id,
            parentPostId: newComment.parentPostId,
        });

        await comment.save();
        console.log(post.metrics);
        await Metrics.findOneAndUpdate(post.metrics._id, { $inc: { nbComments: 1 } });

        return comment;
    }

    async getPost(postId: NonStrictObjectId): Promise<Document & IPost> {
        const post = await Post.findOne({ _id: postId }).populate('createdBy', 'username _id').populate('metrics');

        if (!post) {
            throw new HttpException(StatusCodes.NOT_FOUND, `No post found with ID ${postId}`);
        }

        return post;
    }

    async getPostComments(postId: NonStrictObjectId): Promise<(Document & CommentDocument)[]> {
        const commentsQuery = Comment.find({ parentPostId: postId })
            .sort({ date: -1 })
            .limit(50)
            .populate('createdBy', 'username _id')
            .populate('metrics');

        const res = await commentsQuery.exec();
        for (let i = 0; i < res.length; i++) {
            const comment = res[i].toObject();
            comment.comments = await this.getPostComments(comment._id);
            res[i] = comment;
        }

        return res;
    }

    async getMetricsId(postId: NonStrictObjectId): Promise<NonStrictObjectId> {
        return (await this.getPost(postId)).metrics;
    }

    async getSuggestions(userId: NonStrictObjectId) {
        let suggestions: IPost[] = [];
        const suggestionsIds: IAlgoSuggestionOther[] = (await AlgoSuggestion.findOne({ user: userId }))!.others.slice(
            0,
            200,
        );

        suggestions = await Promise.all(suggestionsIds.map(async (so) => this.getPost(so.item)));

        const nbSuggestions = suggestions.length;

        if (nbSuggestions < 200) {
            //fills missing posts with random posts
            const nbSuggToAdd = 200 - nbSuggestions;

	const suggestionsToAdd = await Post.find({ _id: { $nin: suggestions } }).populate('createdBy', 'username _id').populate('metrics').limit(nbSuggToAdd);

            suggestions = suggestions.concat(suggestionsToAdd);
        }

        return {
            suggestions: suggestions,
        };
    }
}
