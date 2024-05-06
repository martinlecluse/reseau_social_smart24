import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import { Document } from 'mongoose';
import { ItemForComputation } from 'src/algo/algo-suggestion/algo-suggestions-computer';
import { singleton } from 'tsyringe';
import { AlgoSuggestion, IAlgoParams, IAlgoSuggestionOther } from '../../models/algo/algo-suggestion';
import { Comment, CommentDocument, ICreateComment } from '../../models/comment';
import { HttpException } from '../../models/http-exception';
import { Metrics } from '../../models/metrics';
import { ICreatePost, IPost, Post, IPostWithMetrics } from '../../models/post';
import { NonStrictObjectId } from '../../utils/objectid';
import { UserService } from '../user-service';

const _ = require('underscore');

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
            date: DateTime.now(),
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
        await Metrics.findOneAndUpdate(post.metrics._id, { $inc: { nbComments: 1 } });

        return comment;
    }

    async getPost(postId: NonStrictObjectId): Promise<ItemForComputation> {
        const post = await Post.findOne<ItemForComputation>({ _id: postId })
            .populate('metrics')
            .populate('createdBy', 'username _id');

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
        //find diversity and factChecking rate for the user
        const userParams: IAlgoParams = (await this.userService.getUser(userId)).parameters;

        let suggestions: ItemForComputation[] = [];
        const suggestionsIds: IAlgoSuggestionOther[] = (await AlgoSuggestion.findOne({ user: userId }))!.others;

        suggestions = await Promise.all(suggestionsIds.map(async (so) => this.getPost(so.item)));

        //Nombres de factcheck
        const goalFactChecked: number = (userParams.rateFactChecked / 100) * 200;
        const postFactCheckInSuggestion = suggestions.slice(0, 200).filter((sug) => sug.metrics.nbFactChecks > 0);
        const outputFactChecked: number = postFactCheckInSuggestion.length;

        let differenceOutputGoal: number = outputFactChecked - goalFactChecked; // <0 = manque des factcheck | >0 = trop de factcheck

        const nbSuggestions = suggestions.length;

        //Recup des post factchecker pas dans suggestions
        let otherPostFactChecked = [];
        if (differenceOutputGoal != 0) {
            const pipeline = [
                {
                    $lookup: {
                        from: 'metrics',
                        localField: 'metrics',
                        foreignField: '_id',
                        as: 'metrics',
                    },
                },
                {
                    $unwind: '$metrics',
                },
                {
                    $match: {
                        'metrics.nbFactChecks': { $gt: 0 },
                        _id: { $nin: _.pluck(postFactCheckInSuggestion, '_id') },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy',
                    },
                },
            ];

            otherPostFactChecked = await Post.aggregate(pipeline);

            if (differenceOutputGoal < 0) {
                differenceOutputGoal = otherPostFactChecked.length * -1;
            } else {
                differenceOutputGoal = otherPostFactChecked.length;
            }
        }

        //Si pas assez de posts
        if (nbSuggestions < 200) {
            if (differenceOutputGoal < 0) {
                suggestions = suggestions.concat(otherPostFactChecked.slice(0, -differenceOutputGoal));
            } else if (differenceOutputGoal > 0) {
                this.deletePost(suggestions, differenceOutputGoal, true);
            }

            const nbSuggToAdd = 200 - suggestions.length;

            if (nbSuggToAdd > 0) {
                const suggestionsToAdd = await Post.aggregate([
                    { $match: { _id: { $nin: _.pluck(suggestions, '_id') } } },
                    { $limit: nbSuggToAdd },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'createdBy',
                            foreignField: '_id',
                            as: 'createdBy',
                        },
                    },
                    {
                        $lookup: {
                            from: 'metrics',
                            localField: 'metrics',
                            foreignField: '_id',
                            as: 'metrics',
                        },
                    },
                ]);

                suggestions = suggestions.concat(suggestionsToAdd);
            }
        }

        //Si trop ou le bon nombre de posts
        if (nbSuggestions >= 200) {
            suggestions = suggestions.slice(0, 200);

            if (differenceOutputGoal < 0) {
                //Verification des suggestions suivant les 200
                const other = suggestions.slice(201).filter((sug) => sug.metrics.nbFactChecks > 0);

                this.deletePost(suggestions, -differenceOutputGoal, false);

                suggestions = suggestions.concat(other.slice(0, -differenceOutputGoal));

                if (other.length < -differenceOutputGoal) {
                    suggestions = suggestions.concat(
                        otherPostFactChecked.slice(0, -differenceOutputGoal - other.length),
                    );
                }
            } else if (differenceOutputGoal > 0) {
                this.deletePost(suggestions, differenceOutputGoal, true);
            }

            const nbSuggToAdd = 200 - suggestions.length;

            if (nbSuggToAdd > 0) {
                const suggestionsToAdd = await Post.aggregate([
                    { $match: { _id: { $nin: _.pluck(suggestions, '_id') } } },
                    { $limit: nbSuggToAdd },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'createdBy',
                            foreignField: '_id',
                            as: 'createdBy',
                        },
                    },
                    {
                        $lookup: {
                            from: 'metrics',
                            localField: 'metrics',
                            foreignField: '_id',
                            as: 'metrics',
                        },
                    },
                ]);

                suggestions = suggestions.concat(suggestionsToAdd);
            }
        }

        return {
            suggestions: suggestions,
        };
    }

    private deletePost(posts: ItemForComputation[], nb: number, factchecked: boolean) {
        for (let i = posts.length - 1; i >= 0; i--) {
            const condition = factchecked ? posts[i].metrics.nbFactChecks > 0 : posts[i].metrics.nbFactChecks === 0;

            if (condition) {
                posts.splice(i, 1);
                nb--;
            }
            if (nb == 0) {
                break;
            }
        }
    }
}
