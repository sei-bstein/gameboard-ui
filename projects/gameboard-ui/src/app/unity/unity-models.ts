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
    gameBrainUrl: string
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