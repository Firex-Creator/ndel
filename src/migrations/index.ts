import * as migration_20261030_185008_initial from './20261030_185008_initial';

export const migrations = [
  {
    up: migration_20261030_185008_initial.up,
    down: migration_20261030_185008_initial.down,
    name: '20261030_185008_initial',
  },
];
