import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { RatingsLikes } from '../../models/ratings/ratings-likes';
import { PostService } from '../post-service/post-service';
import { UserService } from '../user-service';
import { IRatings } from 'src/models/ratings/ratings';

@singleton()
export class RatingsLikesService {
    constructor(
        private readonly userService: UserService,
        private readonly postService: PostService,
    ) {}

    async createRatingsLikes(userId: string, postId: string): Promise<Document & IRatings> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        const ratingsLikes = new RatingsLikes({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });

        await ratingsLikes.save();

        return ratingsLikes;
    }

    async removeRatingsLikes(userId: string, postId: string): Promise<void> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        await RatingsLikes.findOneAndDelete({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });
    }

    async hasLikedPost(userId: string, postId: string): Promise<boolean> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        return !!(await RatingsLikes.findOne({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        }));
    }
}
