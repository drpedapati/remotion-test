import { Config } from '@remotion/bundler';

export default {
  port: 3000,
  webpackOverride: (config: Config) => config,
};
