"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvUploadModule = void 0;
const data_mapping_service_1 = require("./data-mapping.service");
const prisma_module_1 = require("../prisma/prisma.module");
const common_1 = require("@nestjs/common");
const csv_upload_controller_1 = require("./csv-upload.controller");
const csv_upload_service_1 = require("./csv-upload.service");
const defaults_generator_service_1 = require("./defaults-generator.service");
const file_parser_service_1 = require("./file-parser.service");
let CsvUploadModule = class CsvUploadModule {
};
exports.CsvUploadModule = CsvUploadModule;
exports.CsvUploadModule = CsvUploadModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [csv_upload_controller_1.CsvUploadController],
        providers: [
            csv_upload_service_1.CsvUploadService,
            data_mapping_service_1.DataMappingService,
            defaults_generator_service_1.DefaultsGeneratorService,
            file_parser_service_1.FileParserService,
        ],
        exports: [
            csv_upload_service_1.CsvUploadService,
            data_mapping_service_1.DataMappingService,
            defaults_generator_service_1.DefaultsGeneratorService,
            file_parser_service_1.FileParserService,
        ],
    })
], CsvUploadModule);
//# sourceMappingURL=csv-upload.module.js.map