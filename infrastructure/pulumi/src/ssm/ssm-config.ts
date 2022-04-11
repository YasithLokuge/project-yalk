import { generateResourceName, generateResourceTags } from './../commons/commons';
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Parameter } from '@pulumi/aws/ssm';
import { Output } from '@pulumi/pulumi';

export const createSSMParameter = (
    name: string,
    value: Output<string>,
    type: 'String' | 'StringList' | 'SecureString',
    opts: pulumi.ComponentResourceOptions
): Output<Parameter> => {
    return value.apply(v => {
        return new aws.ssm.Parameter(generateResourceName('ssm', name), {
            name: generateResourceName('ssm', name),
            type: type,
            value: v,
            tags: generateResourceTags('ssm', name),
        }, opts);
    });
}
