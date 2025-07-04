import { TermiiService } from './termii.service';
export declare class TermiiController {
    private readonly termiiService;
    constructor(termiiService: TermiiService);
    testConnection(): Promise<boolean>;
}
