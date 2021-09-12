// utils
function base64ToUtf8(string) {
  return new Uint8Array(
    atob(string)
      .split('')
      .map((char) => char.charCodeAt(0))
  );
}

function utf8ToUtf16(uint8Array) {
  const decoder = new TextDecoder();
  return decoder.decode(uint8Array);
}

/**
 * Return the JSON for a tokenUri
 */
function decodeTokenData(tokenUri) {
  const data = tokenUri.replace('data:application/json;base64,', '');
  return JSON.parse(utf8ToUtf16(base64ToUtf8(data)));
}

/**
 * If you need the SVG in string form for some reason, call:
 *
 * `decodeGeneratedImage(decodedTokenData(...).image)`
 *
 * But many things accept the base64 encoded version
 */
function decodeGeneratedImage(uri) {
  const data = uri.replace('data:image/svg+xml;base64,', '');
  return utf8ToUtf16(base64ToUtf8(data));
}

const contractAddress = '0x1308c158e60D7C4565e369Df2A86eBD853EeF2FB';

const abi = [
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function balanceOf(address owner) view returns (uint256)',
  'function claim()',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function getColor1(uint256 tokenId) pure returns (uint256)',
  'function getColor2(uint256 tokenId) pure returns (uint256)',
  'function getColor3(uint256 tokenId) pure returns (uint256)',
  'function getColor4(uint256 tokenId) pure returns (uint256)',
  'function getColor5(uint256 tokenId) pure returns (uint256)',
  'function getColors(uint256 tokenId) pure returns (string)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function name() view returns (string)',
  'function owner() view returns (address)',
  'function ownerClaim(uint256 tokenId)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function renounceOwnership()',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)',
  'function setApprovalForAll(address operator, bool approved)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  'function symbol() view returns (string)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) pure returns (string)',
  'function totalSupply() view returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function transferOwnership(address newOwner)',
];

/**
 * Fetch all token ids for an address.
 *
 * Tokens must be fetched one-at-a-time, due to how ERC721 contracts currently work.
 * We return all tokens that were fetched successfully, and ignore fetching errors.
 */
async function fetchAllTokenIds(contract, address) {
  const balance = await contract.balanceOf(address);

  const tokens = [];

  for (let index = 0; index < balance; index++) {
    try {
      const tokenId = await contract.tokenOfOwnerByIndex(address, index);

      tokens.push(+tokenId);
    } catch {
      break;
    }
  }

  return tokens;
}

/**
 * Get all tokens for the connected wallet
 *
 * Note: The API calls may fail, so make sure to handle any errors
 */
async function getTokenIds(provider) {
  const signer = provider.getSigner();

  const address = await signer.getAddress();

  const contract = new ethers.Contract(contractAddress, abi, provider);

  const tokenIds = await fetchAllTokenIds(contract, address);

  return tokenIds;
}

/**
 * Get all colors for a given `tokenId`
 *
 * Note: The API calls may fail, so make sure to handle any errors
 */
async function getColors(provider, tokenId) {
  const contract = new ethers.Contract(contractAddress, abi, provider);

  const colors = await contract.getColors(tokenId);

  return colors.split(' ');
}

/**
 * Connect to the user's wallet.
 *
 * Note: This approach may be MetaMask specific.
 *
 * @param ethereum The global web3 provider object
 */
async function getProvider(ethereum) {
  await ethereum.enable();

  return new ethers.providers.Web3Provider(ethereum);
}
