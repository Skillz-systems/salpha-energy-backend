"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1', {
        exclude: [{ path: 'api/payments/odyssey', method: common_1.RequestMethod.ALL }],
    });
    const allowedOrigins = configService.get('ALLOWED_ORIGINS') || '*';
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Energy Project Backend')
        .setDescription('APIs for the Energy Project.')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT Authorization header using the Bearer scheme.',
        in: 'header',
    }, 'access_token')
        .addSecurityRequirements('bearer')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    document.paths = Object.keys(document.paths)
        .sort()
        .reduce((sortedPaths, key) => {
        sortedPaths[key] = document.paths[key];
        return sortedPaths;
    }, {});
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    app.useGlobalFilters();
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    app.useGlobalPipes(new common_1.ValidationPipe());
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map