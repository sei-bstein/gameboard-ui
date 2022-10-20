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