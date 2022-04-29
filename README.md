# project-yalk

| Features | Availability |
|---|---|
| *IaC* | AWS |
| - Cloudfront | ✅ |
| - ACM | ✅ |
| - Iam | ✅ |
| - Route53 | ✅ |
| - S3 | ✅ |
| - SSM | ✅ |
| *UI* |  |
| - Toggle dark | ✅ |
| - Basic routes | ✅ |
| - Appbar & navbar | ✅ |
| - Login | `TODO` |
| - Signup | `TODO` |
| - I18n | `TODO` |
| *API* | `TODO` |
| *DB* | `TODO` |
| *Auth* | `TODO` |
| *CI/CD* |  |
| - AWS codebuild |  ✅ |

## Requirements

- [Pulumi](https://www.pulumi.com/docs/get-started/install)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Node v16.14.2
- Yarn 3.2.0

## Getting Started

- [Configure pulumi to access AWS](https://www.pulumi.com/docs/get-started/aws/begin/#configure-pulumi-to-access-your-aws-account)
- Use admin credentials in your local environment to create a new AWS assume role using pulumi. (Not sure if this is the best way to do.)
- Change the project name to your desired name. (including `package.json`)
- Change the configs in `Pulumi.yaml`, `Pulumi.[env].yaml` to your desired values.
- Run `yarn install` from the root directory.
- Create a new `.env` file in the `packages/web-cliet` directory, copying the contents of `.env.template`.
- Run `yarn workspace @yalk/web-client build` from the root directory.

## Initial setup (Manual steps and things that need to be done locally)

- Create a `Route53` hosted zone with desired domain name. ie. `yalk.io`
- Add the new hosted zone details in `Pulumi.yaml` and `Pulumi.[env].yaml`.
- If you are not using pulumi cloud, create an `S3` bucket to store your pulumi state. (ex: `state.yalk.io`)
- Delete the `encryptionsalt` variables in `Pulumi.yaml` and `Pulumi.[env].yaml`
- Use the following command to configure `Pulumi` to use the above created S3 bucket for state storage.

```sh
yarn workspace @yalk/infra-aws-pulumi pulumi login s3://<bucket-name>
```

- Use the following command to create a new `Pulumi` stack.

```sh
yarn workspace @yalk/infra-aws-pulumi pulumi stack init staging
```

- Use the following command to change the secret provider to `passphrase`.

```sh
yarn workspace @yalk/infra-aws-pulumi pulumi stack change-secrets-provider passphrase
```

- Use the following command to deploy the stack.

```sh
yarn workspace @yalk/infra-aws-pulumi pulumi up
```

- You may need to do the same for any additional environments. ie. `production`. (You can use the same `S3` bucket for all environments.)

## CI/CD

- Create a repository on `GitHub`, `bitbucket` or `codecommit`.
- Push your code to the repository.
- Create `codebuild` projects to build your code. (Here's how I did on my own setup. Suggestions are welcome.)
  - `project-yalk-staging-infra` with `.ci-cd/pulumi-buildspec.yaml`
  - `project-yalk-production-infra` with `.ci-cd/pulumi-buildspec.yaml`
  - `project-yalk-staging-ui-deploy` with `.ci-cd/ui-buildspec.yaml`
  - `project-yalk-production-ui-deploy` with `.ci-cd/ui-buildspec.yaml`
- Set the following environment variables in above build projects:
  - `PULUMI_CONFIG_PASSPHRASE`: `<your pulumi passphrase>`
  - `STACK`: `<stack-name>` (ex: `staging`)

## Environment Variables

- Currently the environment variables which shared across projects are set in the `AWS` ssm parameter store using pulumi, then referred in the relevant `buildspec.yaml` files.

## License

This project is licensed under the MIT [License](LICENSE.md).

## Contributing

This project is open source. Contributions are welcome!
See the [Contribution guide](CONTRIBUTING.md)
## Questions

If you have any questions, please feel free to contact me.
## Credits

See the [Credits](CREDITS.md)
