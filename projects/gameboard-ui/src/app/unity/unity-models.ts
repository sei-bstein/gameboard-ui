export interface UnityBoardContext {
    sessionExpirationTime: Date;
    gameId: string;
    teamId: string;
}

export interface UnityActiveGame 
{
    gamespaceId: string;
    headlessUrl: string;
    vms: VMStruct[];
    serverIp: string,
    gameBrainUrl: string;
    gameId: string;
    teamId: string;
    sessionExpirationTime: Date;
}

export interface UnityDeployContext {
    gameId: string;
    teamId: string;
}

export interface VMStruct {
    Id: string;
    Url: string;
    Name: string;
}