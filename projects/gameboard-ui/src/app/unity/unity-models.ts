export interface UnityDeployContext {
    sessionExpirationTime: Date;
    gameId: string;
    teamId: string;
}

export interface UnityUndeployContext {
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

export interface UnityDeployResult { 
    gamespaceId: string;
    headlessUrl: string;
    vms: UnityGameVM[];
}

export interface UnityGameVM {
    Id: string;
    Url: string;
    Name: string;
}