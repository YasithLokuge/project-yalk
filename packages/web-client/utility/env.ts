
export type Config = {
    hostname: string;
    application: string;
    stage: string;
};

const configs: Config = {
    hostname: process.env.NEXT_PUBLIC_HOSTNAME ?? 'localhost',
    application: process.env.NEXT_PUBLIC_APPLICATION ?? 'Project Yalk',
    stage: process.env.NEXT_PUBLIC_STAGE ?? 'development',
}

export default configs;