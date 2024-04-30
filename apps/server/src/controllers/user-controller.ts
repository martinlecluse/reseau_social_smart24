import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { UserService } from '../services/user-service';
import { AbstractController } from './abstract-controller';

@singleton()
export class UserController extends AbstractController {
    constructor(private readonly userService: UserService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post('/login', async (req, res, next) => {
            try {
                const foundUser = await this.userService.login(req.body);
                res.status(200).send(foundUser);
            } catch (error) {
                next(error);
            }
        });

        router.post('/user/trustUser', (req, res, next) => {

            //unfold parameters
            const userId = '6630e8211bad35dff50ccc85';
            const otherUserId = '6630be9d130907c60efc4aaa';

            try {
                this.userService.user_trustUser_post(userId, otherUserId);
                res.status(StatusCodes.OK).send();
            } catch(error) {
                next();
            }
        })

        router.post('/user/untrustUser', (req, res, next) => {

            const userId = '6630e8211bad35dff50ccc85';
            const otherUserId = '6630be9d130907c60efc4aaa';
            try {
                this.userService.user_untrustUser_post(userId, otherUserId)
                res.status(StatusCodes.OK).send()
            } catch(error) {
                next();
            }
            
        })

        router.post('/user/visitUserProfile', (req, res, next) => {

            const otherUserId = '6630f07c080932226bb2612a'
            try {
                this.userService.user_visitUserProfile_post(otherUserId)
                res.status(StatusCodes.OK).send()
            } catch(error) {
                next();
            }
            
        })
      
        router.post(
            '/user/create',
            body('username').trim().notEmpty().withMessage('Username is required'),
            body('mail').trim().isEmail().withMessage('Invalid email'),
            body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
            async (req, res, next) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
                }
                try {
                    await this.userService.saveUser(
                        req.body.username,
                        req.body.mail,
                        req.body.password,
                        req.body.name,
                        req.body.surname,
                        req.body.birthday,
                        req.body.factChecker,
                        req.body.organization,
                    );
                    res.status(StatusCodes.OK).send('Connected to db!');
                } catch (e) {
                    next(e);
                }
            },
        );
    }
}
