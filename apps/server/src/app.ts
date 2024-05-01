import express from 'express';
import cors from 'cors';
import { singleton } from 'tsyringe';
import { HttpException } from './models/http-exception';
import { errorHandler } from './middleware/error-handler';
import { DatabaseService } from './services/database-service/database-service';
import { UserController } from './controllers/user-controller';
import { PostController } from './controllers/post-controller/post-controller';
import { MetricsController } from './controllers/metrics-controller';
import { FactCheckerController } from './controllers/factCheck-controller/factCheck-controller';

@singleton()
export class Application {
    private app: express.Application;

    constructor(
        private userController: UserController,
        private postController: PostController,
        private metricsController: MetricsController,
        private factCheckerController: FactCheckerController,
        private readonly databaseService: DatabaseService,
    ) {
        this.app = express();

        this.app.use(express.json());
        this.app.use(cors({ origin: '*' }));

        this.configureRoutes();
    }

    listen(port: number | string): void {
        this.app.listen(port, () => {
            // eslint-disable-next-line no-console
            console.log(`🚀 Server up on port ${port} (http://localhost:${port})`);
        });
    }

    async init() {
        await this.databaseService.connect();
        try {
            // eslint-disable-next-line no-console
            console.log('🗃️ Connected to database');
        } catch (error) {
            console.error('Error connecting to database: ', error);
        }
    }

    private configureRoutes(): void {
        this.userController.use(this.app);
        this.postController.use(this.app);
        this.metricsController.use(this.app);
        this.factCheckerController.use(this.app);

        this.app.use('**', (req, res, next) => {
            next(new HttpException(404, `${req.method} ${req.url} not found`));
        });

        this.app.use(errorHandler);
    }
}
