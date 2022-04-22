
import * as pulumi from "@pulumi/pulumi";

export const projectStackName = `${pulumi.getProject()}-${pulumi.getStack()}`

export const generateResourceName = (type: string, name: string): string => {
    return `${projectStackName}-${type}-${name}`
}

export const generateResourceTags = (type: string, name: string) => {
    return {
        Environment: pulumi.getStack(),
        Project: pulumi.getProject(),
        Name: name,
        Resource: generateResourceName(type, name),
        Type: type,
    }
}

export interface Settings {
    hostedZone: string;
    domain: string;
    externalId: string;
    role: string;
    sessionName?: string;
    user: string;
    userKey: string;
    application: string;
}

export const getSettings = (): Settings => {
    let config = new pulumi.Config(); 
    const settings: Settings = config.requireObject<Settings>("settings");
    settings.externalId = settings.externalId ?? generateResourceName('iam', 'external-id');
    settings.user = settings.user ?? generateResourceName('iam', 'user');
    settings.userKey = settings.userKey ?? generateResourceName('iam', 'user-key');
    settings.role = settings.role ?? generateResourceName('iam', 'role');
    settings.sessionName = settings.sessionName ?? generateResourceName('iam', 'session');
    return settings;
}