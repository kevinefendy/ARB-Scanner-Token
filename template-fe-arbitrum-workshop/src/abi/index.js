import SafeTokenABI from './SafeToken.json' with { type: 'json' };
import MintableTokenABI from './MintableToken.json' with { type: 'json' };
import TaxTokenABI from './TaxToken.json' with { type: 'json' };
import HoneypotTestTokenABI from './HoneypotTestToken.json' with { type: 'json' };
import ERC20ABI from './ERC20.json' with { type: 'json' };

export {
  SafeTokenABI,
  MintableTokenABI,
  TaxTokenABI,
  HoneypotTestTokenABI,
  ERC20ABI,
};

export const CONTRACT_ABIS = {
  SafeToken: SafeTokenABI,
  MintableToken: MintableTokenABI,
  TaxToken: TaxTokenABI,
  HoneypotTestToken: HoneypotTestTokenABI,
  ERC20: ERC20ABI,
};

export default CONTRACT_ABIS;
