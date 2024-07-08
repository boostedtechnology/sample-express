const isLocalEnv = (): boolean => ['development', 'test'].includes(process.env['NODE_ENV'] as string);

export { isLocalEnv };
