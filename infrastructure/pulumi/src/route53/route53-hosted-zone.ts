import * as aws from "@pulumi/aws";
import { Distribution } from "@pulumi/aws/cloudfront";
import { GetZoneResult, Record } from "@pulumi/aws/route53";
import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi";
import { generateResourceName } from "../commons/commons";

export const getHostedZone = async (
    parentDomain: string, 
    opts: pulumi.ComponentResourceOptions 
): Promise<GetZoneResult> => {
    return aws.route53.getZone({ name: parentDomain }, opts);
}


export const createRecordSet = (
    name: Input<string>,
    hostedZoneResult: Promise<GetZoneResult>,
    type: Input<string>,
    records: Input<Input<string>[]>,
    ttl: Input<number>,
    opts: pulumi.ComponentResourceOptions,
):Record => {
    return new aws.route53.Record(generateResourceName('route53',`record`), {
        name: name,
        zoneId: hostedZoneResult.then(hostedZone => hostedZone.zoneId),
        type: type,
        records: records,
        ttl: ttl,
    }, { ...opts });
}

export const createAliasRecord = (
    subdomain: Input<string>,
    distribution: Distribution,
    hostedZoneResult: Promise<GetZoneResult>,
    opts: pulumi.ComponentResourceOptions,
): Record => {
    return new aws.route53.Record(generateResourceName('route53',`alias-record`), {
        name: subdomain,
        zoneId: hostedZoneResult.then(hostedZone => hostedZone.zoneId),
        type: 'A',
        aliases: [
            {
                name: distribution.domainName,
                zoneId: distribution.hostedZoneId,
                evaluateTargetHealth: true,
            }
        ],
    }, { ...opts });
}