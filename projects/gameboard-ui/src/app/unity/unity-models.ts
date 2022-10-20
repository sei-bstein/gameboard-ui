export interface UnityBoardContext {
    sessionExpirationTime: Date;
    gameId: string;
    teamId: string;
}

export interface UnityActiveGame 
{
    gamespaceId: string;
    headlessUrl: string;
    vms: UnityGameVM[];
    gameId: string;
    teamId: string;
    sessionExpirationTime: Date;
}

export interface UnityDeployContext {
    gameId: string;
    teamId: string;
}

export interface UnityGameVM {
    Id: string;
    Url: string;
    Name: string;
}