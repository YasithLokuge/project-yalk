import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { generateResourceName, generateResourceTags } from "../commons/commons";
import { createRecordSet } from "../route53/route53-hosted-zone";
import { Certificate, CertificateValidation } from "@pulumi/aws/acm";
import { Input } from "@pulumi/pulumi";
import { GetZoneResult } from "@pulumi/aws/route53";


export const createCertificateValidationDomain = (
    certificate: Certificate, 
    hostedZoneResult: Promise<GetZoneResult>,
    ttl: Input<number>,
    opts: pulumi.ComponentResourceOptions
): CertificateValidation => {
    const certificateValidationDomain = createRecordSet(
        certificate.domainValidationOptions[0].resourceRecordName,
        hostedZoneResult,
        certificate.domainValidationOptions[0].resourceRecordType,
        [certificate.domainValidationOptions[0].resourceRecordValue],
        ttl,
        opts,
    );
    const validationRecordFqdns = [certificateValidationDomain.fqdn];

    const certificateValidation = new aws.acm.CertificateValidation(generateResourceName('acm',"certificateValidation"), {
        certificateArn: certificate.arn,
        validationRecordFqdns: validationRecordFqdns,
    }, { ...opts });

    return certificateValidation;
}

export const createCertificate = (
    domain: string, 
    opts: pulumi.ComponentResourceOptions
): Certificate => {
    const certificateConfig: aws.acm.CertificateArgs = {
        domainName: domain,
        validationMethod: "DNS",
        subjectAlternativeNames: [],
        tags: generateResourceTags('acm', domain),
    };
    return new aws.acm.Certificate(generateResourceName('acm', domain), certificateConfig, opts);
}