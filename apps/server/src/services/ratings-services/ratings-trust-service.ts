import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { RatingsTrust, IRatingsTrust } from '../../models/ratings/ratings-trust';
import { PostService } from '../post-service/post-service';
import { UserService } from '../user-service';

@singleton()
export class RatingsTrustService {
    constructor(
        private readonly userService: UserService,
        private readonly postService: PostService,
    ) {}

    async createRatingsTrust(userId: string, postId: string): Promise<Document & IRatingsTrust> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        const ratingsTrust = new RatingsTrust({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });

        await ratingsTrust.save();

        return ratingsTrust;
    }

    async removeRatingsTrust(userId: string, postId: string): Promise<void> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        await RatingsTrust.findOneAndDelete({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });
    }

    async hasTrustedPost(userId: string, postId: string): Promise<boolean> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        return !!(await RatingsTrust.findOne({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        }));
    }
}
