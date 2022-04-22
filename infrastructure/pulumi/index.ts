import { createSSMParameter } from './src/ssm/ssm-config';
import { DistributionArgs, OriginAccessIdentity } from '@pulumi/aws/cloudfront';
import { createBucket, createBucketPolicy } from './src/s3/s3-create-bucket';
import { assumeRole } from './src/iam/iam-assume-role';    
import { Bucket } from '@pulumi/aws/s3';
import { createCertificate, createCertificateValidationDomain } from './src/acm/acm-certificate';
import { getSettings, Settings } from './src/commons/commons';
import { 
    generateOriginAccessIdentity, 
    generateDistributionArgs, 
    createDistribution 
} from './src/cloudfront/cloudfront-cdn';
import { createAliasRecord, getHostedZone } from './src/route53/route53-hosted-zone';
import * as pulumi from "@pulumi/pulumi";

export = async () => {
    const settings: Settings = getSettings();
    console.log(settings);
    let assumedRole = assumeRole();
    // Create an instance of the S3Folder component
    let bucket: Bucket = createBucket(
        settings.domain, 
        true, 
        { provider: assumedRole, dependsOn: assumedRole }
    );
    let logsBucket: Bucket = createBucket(`${settings.domain}-logs`, false, { provider: assumedRole, dependsOn: assumedRole });
    let hostedZoneResult = getHostedZone(
        settings.hostedZone, 
        { provider: assumedRole, dependsOn: assumedRole }
    )

    let certificate = createCertificate(
        settings.domain,
        { provider: assumedRole, dependsOn: assumedRole }
    )

    let certificateValidation = createCertificateValidationDomain(
        certificate,
        hostedZoneResult,
        60 * 10,
        { provider: assumedRole, dependsOn: [assumedRole, certificate ] }
    )

    let originAccessIdentity: OriginAccessIdentity = generateOriginAccessIdentity(
        { provider: assumedRole, dependsOn: assumedRole }
    ) 
    let distributionArgs: DistributionArgs = generateDistributionArgs(
        [settings.domain],
        bucket,
        originAccessIdentity,
        certificate.arn,
        logsBucket,
        settings.domain,
        60,
    )

    let contentDistribution = createDistribution(
        distributionArgs,
        { provider: assumedRole, dependsOn: [assumedRole, certificateValidation] }
    );

    let bucketPolicy = createBucketPolicy(
        bucket, 
        originAccessIdentity.iamArn,
        { provider: assumedRole, dependsOn: [assumedRole, bucket, contentDistribution] }
    );

    let aliasRecord = createAliasRecord(
        settings.domain.replace(`.${settings.hostedZone}`, '') as pulumi.Input<string>,
        contentDistribution,
        hostedZoneResult,
        { provider: assumedRole, dependsOn: [assumedRole, contentDistribution] }
    );

    createSSMParameter('s3-website-bucket', bucket.bucket, 'String',  { provider: assumedRole, dependsOn: [assumedRole, bucket] });
    createSSMParameter('cloudfront-id', contentDistribution.id, 'String',  { provider: assumedRole, dependsOn: [assumedRole, contentDistribution] });
    createSSMParameter('application', pulumi.interpolate`${settings.application}`, 'String',  { provider: assumedRole, dependsOn: [assumedRole, contentDistribution] });

    // Export output property of `bucket` as a stack output
    return {
        contentBucketUri: pulumi.interpolate`s3://${bucket.bucket}`,
        contentBucketWebsiteEndpoint: pulumi.interpolate`${bucket.bucketRegionalDomainName}`,
        cloudFrontDomain: pulumi.interpolate`${contentDistribution.domainName}`,
        cloudFrontDistributionId: pulumi.interpolate`${contentDistribution.id}`,
        targetDomainEndpoint: `https://${settings.domain}/`
    }
}