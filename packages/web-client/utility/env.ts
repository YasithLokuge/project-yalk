
export type Config = {
    hostname: string;
    application: string;
};

const configs: Config = {
    hostname: process.env.NEXT_PUBLIC_HOSTNAME ?? 'localhost',
    application: process.env.NEXT_PUBLIC_APPLICATION ?? 'Project Yalk',
}

export default configs;