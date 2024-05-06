import { StatusCodes } from 'http-status-codes';
import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { FactCheck, ICreateFactCheck, IFactCheck } from '../../models/FactCheck';
import { HttpException } from '../../models/http-exception';
import { MetricsService } from '../metrics-service/metrics-service';
import { PostService } from '../post-service/post-service';
import { UserService } from '../user-service';
import { NonStrictObjectId } from 'src/utils/objectid';

@singleton()
export class FactCheckService {
    constructor(
        private readonly userService: UserService,
        private readonly postService: PostService,
        private readonly metricsService: MetricsService,
    ) {}

    async hasUserFactCheckedPost(userId: string, postId: string): Promise<boolean> {
        const userObjectId = new Types.ObjectId(userId);
        const postObjectId = new Types.ObjectId(postId);

        const factCheck = await FactCheck.findOne({ emittedBy: userObjectId, postId: postObjectId });

        return factCheck !== null;
    }

    async createAssignFactCheck(userId: string, newFactCheck: ICreateFactCheck): Promise<Document & IFactCheck> {
        const userObjectId = new Types.ObjectId(userId);
        const user = await this.userService.getUser(userObjectId);
        const post = await this.postService.getPost(newFactCheck.postId);

        if (post.createdBy.toString() == userId) {
            throw new HttpException(StatusCodes.BAD_REQUEST, `User is the creator of this post`);
        }

        if (!user.factChecker) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, `User is not a fact checker`);
        }

        if (await this.hasUserFactCheckedPost(userId, newFactCheck.postId)) {
            throw new HttpException(StatusCodes.BAD_REQUEST, `User has already fact checked this post`);
        }

        const factCheck = new FactCheck({
            grade: newFactCheck.grade,
            comment: newFactCheck.comment,
            postId: new Types.ObjectId(newFactCheck.postId),
            emittedBy: userObjectId,
        });

        await factCheck.save();

        await this.userService.updateUser(userId, { $inc: { nbFactChecked: 1 } });

        const postId = new Types.ObjectId(newFactCheck.postId);
        const metricsId = await this.postService.getMetricsId(postId);
        await this.metricsService.addFactCheck(metricsId, factCheck._id, factCheck.grade);

        return factCheck;
    }

    async getFactChecksByPost(postId: NonStrictObjectId): Promise<(Document & IFactCheck)[]> {
        const factChecksQuery = FactCheck.find({ postId: postId })
            .sort({ date: -1 })
            .populate('emittedBy', 'username _id');

        const res = await factChecksQuery.exec();
        return res.length > 0 ? res : [];
    }
}
