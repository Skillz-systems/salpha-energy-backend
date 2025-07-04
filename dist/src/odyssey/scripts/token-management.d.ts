#!/usr/bin/env node
declare class OdysseyTokenCLI {
    private generateSecureToken;
    generateToken(clientName: string, expirationDays?: number): Promise<void>;
    listTokens(): Promise<void>;
}
export { OdysseyTokenCLI };
