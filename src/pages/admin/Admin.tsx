import { useState } from 'react';

import {hooks as readerHooks} from '../../connectors/reader';

export default function Admin () {
  const provider = readerHooks.useProvider();

  return <div>
    <h1>Admin</h1>
  </div>
}