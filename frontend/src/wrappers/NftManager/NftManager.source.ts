/* Generated automatically from ton/scripts/manager.update-test-wrapper.ts */
import { Cell } from 'ton-core';

const NftManagerCodeBoc =
	'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';
const NftManagerSystemBoc =
	'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';

export const NftManagerCodeCell = Cell.fromBase64(NftManagerCodeBoc);
export const NftManagerSystemCell = Cell.fromBase64(NftManagerSystemBoc);
