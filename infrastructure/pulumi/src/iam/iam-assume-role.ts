import { 
    generateResourceTags, 
    generateResourceName,
    getSettings,
    projectStackName,
    Settings,
} from './../commons/commons';
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Provider } from '@pulumi/aws';


export const assumeRole = (opts?: pulumi.ComponentResourceOptions): Provider => {

    const settings: Settings = getSettings();
    const sessionName = settings.sessionName;
    const externalId = settings.externalId;
    const userName = settings.user;
    const userKey = settings.userKey;
    const roleName = settings.role;

    const unprivilegedUser = new aws.iam.User(userName, {
        name: userName,
        tags: generateResourceTags('iam', 'user'),
    });

    const unprivilegedUserCreds = new aws.iam.AccessKey(userKey, {
        user: unprivilegedUser.name,
    }, 
    // additional_secret_outputs specify properties that must be encrypted as secrets
    // https://www.pulumi.com/docs/intro/concepts/resources/#additionalsecretoutputs
    { additionalSecretOutputs: ["secret"] });

    const policyJson = unprivilegedUser.arn.apply(arn => {
        return JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "codebuild.amazonaws.com",
                },
            },{
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    AWS: arn,
                },
            }],
        });
    });

    const role = new aws.iam.Role(roleName, {
        name: roleName,
        description: roleName,
        assumeRolePolicy: policyJson,
        tags: generateResourceTags('iam', 'role')
    });

    const rolePolicy = new aws.iam.RolePolicy(generateResourceName('iam', "role-policy"), {
        name: generateResourceName('iam', "role-policy"),
        role: role,
        policy: {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "AllowS3Management",
                    Effect: "Allow",
                    Resource: [
                        `arn:aws:s3:::*${settings.hostedZone}`, 
                        `arn:aws:s3:::*${settings.hostedZone}/*`,
                        `arn:aws:s3:::*${settings.hostedZone}*`, 
                        `arn:aws:s3:::*${settings.hostedZone}*/*`,
                        `arn:aws:s3:::${projectStackName}`, 
                        `arn:aws:s3:::${projectStackName}/*`, 
                        `arn:aws:s3:::${projectStackName}*`, 
                        `arn:aws:s3:::${projectStackName}*/*`
                    ],
                    Action: ["s3:*"],
                },
                {
                    Sid: "AllowHostedZoneActions",
                    Effect: "Allow",
                    Action: [
                        "route53:ListHostedZones",
                        "route53:GetHostedZone",
                        "route53:ListTagsForResource",
                        "route53:ChangeTagsForResource",
                        "route53:ChangeResourceRecordSets",
                        "route53:GetChange",
                        "route53:ListResourceRecordSets",
                    ],
                    Resource: "*"
                },
                {
                    "Sid": "AllowCertificateActions",
                    "Effect": "Allow",
                    "Action": [
                        "acm:RequestCertificate",
                        "acm:AddTagsToCertificate",
                        "acm:ListTagsForCertificate",
                        "acm:DescribeCertificate",
                        "acm:GetCertificate",
                        "acm:ListCertificates",
                        "acm:DeleteCertificate",
                    ],
                    "Resource": "*"
                },
                {
                    "Sid": "AllowCloudFrontActions",
                    "Effect": "Allow",
                    "Action": [
                        "cloudfront:CreateDistribution",
                        "cloudfront:GetDistribution",
                        "cloudfront:ListDistributions",
                        "cloudfront:DeleteDistribution",
                        "cloudfront:UpdateDistribution",
                        "cloudfront:TagResource",
                        "cloudfront:ListTagsForResource",
                        "cloudfront:CreateCloudFrontOriginAccessIdentity",
                        "cloudfront:GetCloudFrontOriginAccessIdentity",
                        "cloudfront:DeleteCloudFrontOriginAccessIdentity",
                        "cloudfront:CreateInvalidation",
                    ],
                    "Resource": "*"
                },
                {
                    "Sid": "AllowCloudWatchLogsActions",
                    "Effect": "Allow",
                    "Action": [
                        "logs:CreateLogStream",
                        "logs:CreateLogGroup",
                        "logs:PutLogEvents"
                    ],
                    "Resource": "*"
                },
                {
                    "Sid": "AllowCodeCommitActions",
                    "Effect": "Allow",
                    "Action": [
                        "codecommit:GitPull"
                    ],
                    "Resource": "*"
                },
                {
                    "Sid": "AllowIamActions",
                    "Effect": "Allow",
                    "Action": [
                        "iam:PutRolePolicy"
                    ],
                    "Resource": "*"
                },
                {
                    "Sid": "AllowSSMActions",
                    "Effect": "Allow",
                    "Action": [
                        "ssm:PutParameter",
                        "ssm:DeleteParameter",
                        "ssm:DescribeParameters",
                        "ssm:RemoveTagsFromResource",
                        "ssm:AddTagsToResource",
                        "ssm:ListTagsForResource",
                        "ssm:GetParametersByPath",
                        "ssm:GetParameters",
                        "ssm:GetParameter",
                        "ssm:DeleteParameters"
                    ],
                    "Resource": "*"
                },
            ],
        },
    }, {parent: role});

    return new aws.Provider(generateResourceName('iam', "role-provider"), {
        assumeRole: {
            roleArn: role.arn.apply(async(arn) => {
                //issue: https://github.com/pulumi/pulumi-aws/issues/673
                if (!pulumi.runtime.isDryRun()) {
                    await new Promise(resolve => setTimeout(resolve, 30 * 1000));
                }
                return arn
            }),
            sessionName: sessionName,
            externalId: externalId,
        },
        region: aws.config.requireRegion(),
        accessKey: unprivilegedUserCreds.id,
        secretKey: unprivilegedUserCreds.secret,
    }, { dependsOn: [rolePolicy] });

}
