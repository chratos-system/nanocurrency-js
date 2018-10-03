/*!
 * nanocurrency-js: A toolkit for the Nano cryptocurrency.
 * Copyright (c) 2018 Marvin ROGER <dev at marvinroger dot fr>
 * Licensed under GPL-3.0 (https://git.io/vAZsK)
 */
import { blake2bFinal, blake2bInit, blake2bUpdate } from 'blakejs';

import { checkAddress, checkAmount, checkHash, checkType, checkDividend } from './check';

import { convert, Unit } from './conversion';

import { byteArrayToHex, hexToByteArray } from './utils';

import { derivePublicKey } from './keys';

const STATE_BLOCK_PREAMBLE_BYTES = new Uint8Array(32);
STATE_BLOCK_PREAMBLE_BYTES[31] = 6;
const DIVIDEND_BLOCK_PREAMBLE_BYTES = new Uint8Array(32);
DIVIDEND_BLOCK_PREAMBLE_BYTES[31] = 7;
const CLAIM_BLOCK_PREAMBLE_BYTES = new Uint8Array(32);
CLAIM_BLOCK_PREAMBLE_BYTES[31] = 8;

/** Hash block parameters. */
export interface HashBlockParams {
  /** The block type */
  type: string;

  /** The account address */
  account: string;
  /**
   * The hash of the previous block on the account chain, in hexadecimal format
   *
   * `0000000000000000000000000000000000000000000000000000000000000000` if `open` block.
   */
  previous: string;
  /** The destination address */
  representative: string;
  /** The resulting balance, in raw */
  balance: string;
  /**
   * The account or block hash meant as a link, in address or hexadecimal format
   *
   * Read more on the [Official Nano Wiki](https://github.com/nanocurrency/raiblocks/wiki/Universal-Blocks-Specification)
   */
  link: string | null;

  dividend: string;
}

export /**
 * Hash a block.
 *
 * @param params - Parameters
 * @returns Hash, in hexadecimal format
 */
function hashBlock(params: HashBlockParams) {
  if (!checkType(params.type)) throw new Error('Incorrect type for block');
  switch (params.type) {
    case 'state': return hashBlockState(params)
    case 'dividend': return hashBlockDividend(params)
    case 'claim': return hashBlockClaim(params)
    default: throw new Error('Incorrect')
  }
}

function hashBlockState(params: HashBlockParams) {
  if (!checkAddress(params.account)) throw new Error('Account is not valid');
  if (!checkHash(params.previous)) throw new Error('Previous is not valid');
  if (!checkAddress(params.representative)) {
    throw new Error('Representative is not valid');
  }
  if (!checkAmount(params.balance)) throw new Error('Balance is not valid');
  if (params.link === null) throw new Error('Link should exist')
  const link = params.link || '';
  let linkIsAddress = false;
  let linkIsBlockHash = false;
  if (checkAddress(link)) linkIsAddress = true;
  else if (checkHash(link)) linkIsBlockHash = true;
  else throw new Error('Link is not valid');

  const accountBytes = hexToByteArray(derivePublicKey(params.account));
  const previousBytes = hexToByteArray(params.previous);
  const representativeBytes = hexToByteArray(derivePublicKey(params.representative));
  const balanceHex = convert(params.balance, { from: Unit.raw, to: Unit.hex });
  const balanceBytes = hexToByteArray(balanceHex);
  const dividendBytes = hexToByteArray(params.dividend);
  let linkBytes;
  if (linkIsAddress) {
    linkBytes = hexToByteArray(derivePublicKey(link));
  } else if (linkIsBlockHash) {
    linkBytes = hexToByteArray(link);
  }

  const context = blake2bInit(32);
  blake2bUpdate(context, STATE_BLOCK_PREAMBLE_BYTES);
  blake2bUpdate(context, accountBytes);
  blake2bUpdate(context, previousBytes);
  blake2bUpdate(context, representativeBytes);
  blake2bUpdate(context, balanceBytes);
  blake2bUpdate(context, linkBytes);
  blake2bUpdate(context, dividendBytes);
  const hashBytes = blake2bFinal(context);

  return byteArrayToHex(hashBytes);
}

function hashBlockDividend(params: HashBlockParams) {
  if (!checkAddress(params.account)) throw new Error('Account is not valid');
  if (!checkHash(params.previous)) throw new Error('Previous is not valid');
  if (!checkAddress(params.representative)) {
    throw new Error('Representative is not valid');
  }
  if (!checkAmount(params.balance)) throw new Error('Balance is not valid');
  if (!checkDividend(params.dividend)) throw new Error('Dividend is not valid');

  const accountBytes = hexToByteArray(derivePublicKey(params.account));
  const previousBytes = hexToByteArray(params.previous);
  const representativeBytes = hexToByteArray(derivePublicKey(params.representative));
  const balanceHex = convert(params.balance, { from: Unit.raw, to: Unit.hex });
  const balanceBytes = hexToByteArray(balanceHex);
  const dividendBytes = hexToByteArray(params.dividend);

  const context = blake2bInit(32);
  blake2bUpdate(context, DIVIDEND_BLOCK_PREAMBLE_BYTES);
  blake2bUpdate(context, accountBytes);
  blake2bUpdate(context, previousBytes);
  blake2bUpdate(context, representativeBytes);
  blake2bUpdate(context, balanceBytes);
  blake2bUpdate(context, dividendBytes);
  const hashBytes = blake2bFinal(context);

  return byteArrayToHex(hashBytes);

}

function hashBlockClaim(params: HashBlockParams) {
  if (!checkAddress(params.account)) throw new Error('Account is not valid');
  if (!checkHash(params.previous)) throw new Error('Previous is not valid');
  if (!checkAddress(params.representative)) {
    throw new Error('Representative is not valid');
  }
  if (!checkAmount(params.balance)) throw new Error('Balance is not valid');
  if (!checkDividend(params.dividend)) throw new Error('Dividend is not valid');

  const accountBytes = hexToByteArray(derivePublicKey(params.account));
  const previousBytes = hexToByteArray(params.previous);
  const representativeBytes = hexToByteArray(derivePublicKey(params.representative));
  const balanceHex = convert(params.balance, { from: Unit.raw, to: Unit.hex });
  const balanceBytes = hexToByteArray(balanceHex);
  const dividendBytes = hexToByteArray(params.dividend);

  const context = blake2bInit(32);
  blake2bUpdate(context, CLAIM_BLOCK_PREAMBLE_BYTES);
  blake2bUpdate(context, accountBytes);
  blake2bUpdate(context, previousBytes);
  blake2bUpdate(context, representativeBytes);
  blake2bUpdate(context, balanceBytes);
  blake2bUpdate(context, dividendBytes);
  const hashBytes = blake2bFinal(context);

  return byteArrayToHex(hashBytes);

}
