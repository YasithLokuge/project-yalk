import { Bucket, BucketPolicy } from '@pulumi/aws/s3';
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { generateResourceName, generateResourceTags } from "../commons/commons";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime";
import { Input } from '@pulumi/pulumi';

export const createBucket = (
    bucketName: string,
    website: boolean,
    opts: pulumi.ComponentResourceOptions,
    contentDir?: string,
): Bucket => {

    // Create an AWS resource (S3 Bucket)
    const bucket = new aws.s3.Bucket(generateResourceName('s3', `${bucketName}`), {
        bucket: bucketName,
        website: website ?
        {
            indexDocument: "index.html",
            errorDocument: "404.html",
        } : undefined,
        tags: generateResourceTags('s3', `${bucketName}`),
    }, opts);

    if (contentDir) {
        const webContentsRootPath = path.join(process.cwd(), contentDir);
        console.log("Syncing contents from local disk at", webContentsRootPath);
        crawlDirectory(
            webContentsRootPath,
            (filePath: string) => {
                const relativeFilePath = filePath.replace(webContentsRootPath + "/", "");
                const contentFile = new aws.s3.BucketObject(
                    generateResourceName('s3', `object-${relativeFilePath}`),
                    {
                        key: relativeFilePath,
                        bucket: bucket,
                        contentType: mime.getType(filePath) || undefined,
                        source: new pulumi.asset.FileAsset(filePath),
                    },
                    {
                        parent: bucket,
                        ...opts,
                    });
            });
    }

    return bucket;   
}

export const createBucketPolicy = (
    bucket: Bucket,
    iamArn: Input<string>,
    opts: pulumi.ComponentResourceOptions
): BucketPolicy => {
    const bucketPolicy = new aws.s3.BucketPolicy(generateResourceName('s3', 'bucket-policy'), {
        bucket: bucket.id, // refer to the bucket created earlier
        policy: pulumi.all([iamArn, bucket.arn]).apply(([oaiArn, bucketArn]) =>JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                Effect: "Allow",
                Principal: {
                    AWS: oaiArn,
                }, // Only allow Cloudfront read access.
                Action: ["s3:GetObject"],
                Resource: [`${bucketArn}/*`], // Give Cloudfront access to the entire bucket.
                },
            ],
        })),
    }, opts);
    return bucketPolicy;
}

const crawlDirectory = (dir: string, f: (_: string) => void) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = `${dir}/${file}`;
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            crawlDirectory(filePath, f);
        }
        if (stat.isFile()) {
            f(filePath);
        }
    }
}