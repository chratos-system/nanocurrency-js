/*!
 * nanocurrency-js: A toolkit for the Nano cryptocurrency.
 * Copyright (c) 2018 Marvin ROGER <dev at marvinroger dot fr>
 * Licensed under GPL-3.0 (https://git.io/vAZsK)
 */
/* tslint:disable object-shorthand-properties-first */
import { checkAddress, checkAmount, checkHash, checkKey, checkType, checkDividend } from './check';

import { deriveAddress, derivePublicKey } from './keys';

import { hashBlock } from './hash';

import { signBlock } from './signature';

/** State block data. */
export interface BlockData {
  /** The block type. Can either be state, dividend or claim */
  type: string;
  /** The PoW. You can give it a `null` if you want to fill this field later */
  work: string | null;
  /** The hash of the previous block on the account chain, in hexadecimal format */
  previous: string;
  /** The destination address */
  representative: string;
  /** The resulting balance */
  balance: string;
  /** The link block hash or the link address, in hexadecimal or address format can be null if not a state type */
  link: string | null;
  /** The dividend block hash */
  dividend: string;
}

/**
 * Create a block.
 *
 * @param secretKey - The secret key to create the block from, in hexadecimal format
 * @param data - Block data
 * @returns Block
 */
export function createBlock(secretKey: string, data: BlockData) {
  if (!checkType(data.type)) throw new Error('Incorrect type for block');
  switch (data.type) {
    case 'state': return createStateBlock(secretKey, data)
    case 'dividend': return createDividendBlock(secretKey, data)
    case 'claim': return createClaimBlock(secretKey, data)
    default: throw new Error('Incorrect type for block')
  }
}

function createStateBlock(secretKey: string, data: BlockData) {
  if (!checkKey(secretKey)) throw new Error('Secret key is not valid');
  if (typeof data.work === 'undefined') throw new Error('Work is not set');
  if (!checkHash(data.previous)) throw new Error('Previous is not valid');
  if (!checkAddress(data.representative)) {
    throw new Error('Representative is not valid');
  }
  if (!checkAmount(data.balance)) throw new Error('Balance is not valid');
  const datalink = data.link || '';
  let linkIsAddress = false;
  if (checkAddress(datalink)) linkIsAddress = true;
  else if (!checkHash(datalink)) throw new Error('Link is not valid');
  if (!checkDividend(data.dividend)) throw new Error('Dividend is not valid');

  const publicKey = derivePublicKey(secretKey);
  const account = deriveAddress(publicKey);

  const hash = hashBlock({
    type: data.type,
    account,
    previous: data.previous,
    representative: data.representative,
    balance: data.balance,
    link: datalink,
    dividend: data.dividend
  });
  const signature = signBlock({ hash, secretKey });

  let link;
  let linkAsAddress;
  if (linkIsAddress) {
    linkAsAddress = datalink;
    link = derivePublicKey(linkAsAddress);
  } else {
    link = datalink;
    linkAsAddress = deriveAddress(link);
  }

  const block = {
    type: data.type,
    account,
    previous: data.previous,
    representative: data.representative,
    balance: data.balance,
    link,
    link_as_account: linkAsAddress,
    dividend: data.dividend,
    work: data.work,
    signature,
  };

  return {
    hash,
    block,
    type: data.type
  };
}

function createDividendBlock(secretKey: string, data: BlockData) {
  if (!checkKey(secretKey)) throw new Error('Secret key is not valid');
  if (typeof data.work === 'undefined') throw new Error('Work is not set');
  if (!checkHash(data.previous)) throw new Error('Previous is not valid');
  if (!checkAddress(data.representative)) {
    throw new Error('Representative is not valid');
  }
  if (!checkAmount(data.balance)) throw new Error('Balance is not valid');
  if (!checkDividend(data.dividend)) throw new Error('Dividend is not valid');

  const publicKey = derivePublicKey(secretKey);
  const account = deriveAddress(publicKey);

  const hash = hashBlock({
    type: data.type,
    account,
    previous: data.previous,
    representative: data.representative,
    balance: data.balance,
    link: null,
    dividend: data.dividend
  });

  const signature = signBlock({ hash, secretKey });

  const block = {
    account,
    previous: data.previous,
    representative: data.representative,
    balance: data.balance,
    dividend: data.dividend,
    work: data.work,
    signature,
  };

  return {
    hash,
    block,
    type: data.type
  };
}

function createClaimBlock(secretKey: string, data: BlockData) {
  if (!checkKey(secretKey)) throw new Error('Secret key is not valid');
  if (typeof data.work === 'undefined') throw new Error('Work is not set');
  if (!checkHash(data.previous)) throw new Error('Previous is not valid');
  if (!checkAddress(data.representative)) {
    throw new Error('Representative is not valid');
  }
  if (!checkAmount(data.balance)) throw new Error('Balance is not valid');
  if (!checkDividend(data.dividend)) throw new Error('Dividend is not valid');

  const publicKey = derivePublicKey(secretKey);
  const account = deriveAddress(publicKey);

  const hash = hashBlock({
    type: data.type,
    account,
    previous: data.previous,
    representative: data.representative,
    balance: data.balance,
    link: null,
    dividend: data.dividend
  });

  const signature = signBlock({ hash, secretKey });

  const block = {
    account,
    previous: data.previous,
    representative: data.representative,
    balance: data.balance,
    dividend: data.dividend,
    work: data.work,
    signature,
  };

  return {
    hash,
    block,
    type: data.type
  };
}
