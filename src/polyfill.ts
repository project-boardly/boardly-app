import { Buffer } from 'buffer';

import * as nextTick from 'next-tick'

(window as any).global = window;
global.Buffer = Buffer;
global.process = {
    env: { DEBUG: undefined },
    version: '',
    nextTick
} as any;