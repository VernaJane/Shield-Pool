"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { ShieldPoolAddresses } from "@/abi/ShieldPoolAddresses";
import { ShieldPoolABI } from "@/abi/ShieldPoolABI";

type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean;
};

type ShieldPoolInfoType = {
  abi: typeof ShieldPoolABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getShieldPoolByChainId(chainId: number | undefined): ShieldPoolInfoType {
  if (!chainId) {
    return { abi: ShieldPoolABI.abi };
  }

  const entry = ShieldPoolAddresses[chainId.toString() as keyof typeof ShieldPoolAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: ShieldPoolABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: ShieldPoolABI.abi,
  };
}

function isZeroHandle(handle?: string): boolean {
  return typeof handle === "string" && /^0x0{64}$/i.test(handle);
}

export const useShieldPool = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [handles, setHandles] = useState<{
    myAmount?: string;
    myRisk?: string;
    poolTotal?: string;
    riskSum?: string;
    lastPayout?: string;
  }>({});
  const [clears, setClears] = useState<Record<string, ClearValueType | undefined>>({});
  const clearsRef = useRef<Record<string, ClearValueType | undefined>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const spRef = useRef<ShieldPoolInfoType | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const isJoiningRef = useRef<boolean>(isJoining);
  const isComputingRef = useRef<boolean>(isComputing);

  const shieldPool = useMemo(() => {
    const c = getShieldPoolByChainId(chainId);
    spRef.current = c;
    // Only prompt when chainId is known and this network has no configured contract address
    if (c.chainId !== undefined && !c.address) {
      setMessage("ShieldPool is not configured for this network.");
    } else {
      // Clear any previous not-configured message when switching networks or once address exists
      setMessage("");
    }
    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!shieldPool) return undefined;
    return Boolean(shieldPool.address) && shieldPool.address !== ethers.ZeroAddress;
  }, [shieldPool]);

  const canView = useMemo(() => {
    return (
      shieldPool.address && (ethersReadonlyProvider || ethersSigner) && !isRefreshing
    );
  }, [shieldPool.address, ethersReadonlyProvider, ethersSigner, isRefreshing]);

  const refreshAllHandles = useCallback(() => {
    if (isRefreshingRef.current) return;
    const runner: ethers.ContractRunner | undefined =
      (ethersSigner as unknown as ethers.ContractRunner) ||
      (ethersReadonlyProvider as ethers.ContractRunner | undefined);
    if (!spRef.current?.address || !runner) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const addr = spRef.current.address;
    const contract = new ethers.Contract(addr, spRef.current.abi, runner);

    Promise.all([
      contract.getMyEncryptedDeposit(),
      contract.getMyEncryptedRisk(),
      contract.getPoolTotalEncrypted(),
      contract.getRiskSumEncrypted(),
      contract.getMyLastPayoutEncrypted(),
    ])
      .then(([myAmount, myRisk, poolTotal, riskSum, lastPayout]) => {
        setHandles({
          myAmount,
          myRisk,
          poolTotal,
          riskSum,
          lastPayout,
        });
      })
      .finally(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, ethersSigner]);

  useEffect(() => {
    refreshAllHandles();
  }, [refreshAllHandles]);

  const canDecrypt = useMemo(() => {
    const anyHandle = Object.values(handles).some(
      (h) => h && !(h in clears)
    );
    return (
      shieldPool.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      anyHandle
    );
  }, [shieldPool.address, instance, ethersSigner, isRefreshing, isDecrypting, handles, clears]);

  const decryptAll = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) return;
    if (!shieldPool.address || !instance || !ethersSigner) return;

    const notDecrypted: string[] = Object.values(handles).filter(
      (h): h is string => Boolean(h) && !(h! in clearsRef.current)
    ) as string[];
    if (notDecrypted.length === 0) return;

    // Short-circuit: if any handle is all-zero, treat its clear value as "0" without decrypting
    const zeroHandles = notDecrypted.filter((h) => isZeroHandle(h));
    if (zeroHandles.length > 0) {
      for (const h of zeroHandles) {
        clearsRef.current[h] = { handle: h, clear: "0" };
      }
      setClears({ ...clearsRef.current });
    }

    const notDecryptedNonZero = notDecrypted.filter((h) => !isZeroHandle(h));
    if (notDecryptedNonZero.length === 0) {
      setMessage("No handles to decrypt");
      return;
    }

    // Split personal vs aggregate handles so aggregate auth failure won't block personal decrypts
    const personalSet = new Set(
      [handles.myAmount, handles.myRisk, handles.lastPayout].filter(Boolean) as string[]
    );
    const aggregateSet = new Set(
      [handles.poolTotal, handles.riskSum].filter(Boolean) as string[]
    );
    const personalToDecrypt = notDecryptedNonZero.filter((h) => personalSet.has(h));
    const aggregateToDecrypt = notDecryptedNonZero.filter((h) => aggregateSet.has(h));

    const thisChainId = chainId;
    const thisAddress = shieldPool.address;
    const thisSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt");

    const run = async () => {
      const isStale = () =>
        thisAddress !== spRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisSigner);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [shieldPool.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        // 1) Decrypt personal handles first
        if (personalToDecrypt.length > 0) {
          setMessage("Call FHEVM userDecrypt (personal)...");
          const personalPairs = personalToDecrypt.map((h) => ({ handle: h, contractAddress: thisAddress! }));
          const resPersonal = await instance.userDecrypt(
            personalPairs,
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          for (const h of personalToDecrypt) {
            clearsRef.current[h] = { handle: h, clear: resPersonal[h] };
          }
          setClears({ ...clearsRef.current });
        }

        // 2) Decrypt aggregate handles (may require viewer authorization)
        if (aggregateToDecrypt.length > 0) {
          try {
            setMessage("Call FHEVM userDecrypt (aggregates)...");
            const aggregatePairs = aggregateToDecrypt.map((h) => ({ handle: h, contractAddress: thisAddress! }));
            const resAgg = await instance.userDecrypt(
              aggregatePairs,
              sig.privateKey,
              sig.publicKey,
              sig.signature,
              sig.contractAddresses,
              sig.userAddress,
              sig.startTimestamp,
              sig.durationDays
            );

            for (const h of aggregateToDecrypt) {
              clearsRef.current[h] = { handle: h, clear: resAgg[h] };
            }
            setClears({ ...clearsRef.current });
          } catch (e) {
            // Do not fail personal decrypts if aggregates are not authorized
            setMessage("Aggregates decryption not authorized. Click 'Authorize Viewer' then try again.");
          }
        }

        setMessage("FHEVM userDecrypt completed");
        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        // All updates moved into the two-stage flow above
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [chainId, shieldPool.address, instance, ethersSigner, handles, fhevmDecryptionSignatureStorage, sameChain, sameSigner]);

  const canJoin = useMemo(() => {
    return shieldPool.address && instance && ethersSigner && !isJoining;
  }, [shieldPool.address, instance, ethersSigner, isJoining]);

  const joinPool = useCallback((amountEth: string | number, risk: number) => {
    if (isRefreshingRef.current || isJoiningRef.current) return;
    if (!shieldPool.address || !instance || !ethersSigner) return;
    const amountEthStr = String(amountEth ?? "0");
    if (amountEthStr.trim() === "" || Number(amountEthStr) <= 0 || risk < 0) return;

    const thisChainId = chainId;
    const thisAddress = shieldPool.address;
    const thisSigner = ethersSigner;
    const contract = new ethers.Contract(thisAddress, shieldPool.abi, thisSigner);

    isJoiningRef.current = true;
    setIsJoining(true);
    setMessage("Start joinPool...");

    const run = async () => {
      const isStale = () =>
        thisAddress !== spRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisSigner);

      try {
        await new Promise((r) => setTimeout(r, 100));

        const input = instance.createEncryptedInput(thisAddress!, thisSigner.address);
        // Convert ETH -> wei
        const wei = ethers.parseEther(amountEthStr);
        // Scale to uint32-compatible units used by contract denominator (wei / 1e14)
        const scaled = wei / 100000000000000n; // 1e14
        const maxU32 = 4294967295n;
        const safeScaled = scaled > maxU32 ? maxU32 : scaled;
        input.add32(Number(safeScaled));
        input.add32(risk);
        const enc = await input.encrypt();

        if (isStale()) {
          setMessage("Ignore joinPool");
          return;
        }

        setMessage("Call joinPool...");
        const tx: ethers.TransactionResponse = await contract.joinPool(
          enc.handles[0],
          enc.handles[1],
          enc.inputProof,
          { value: wei }
        );
        setMessage(`Wait for tx:${tx.hash}...`);
        await tx.wait();
        setMessage("joinPool completed");
        refreshAllHandles();
      } catch (e) {
        setMessage("joinPool failed");
      } finally {
        isJoiningRef.current = false;
        setIsJoining(false);
      }
    };

    run();
  }, [chainId, shieldPool.address, shieldPool.abi, instance, ethersSigner, sameChain, sameSigner, refreshAllHandles]);

  const canCompute = useMemo(() => {
    return shieldPool.address && instance && ethersSigner && !isComputing;
  }, [shieldPool.address, instance, ethersSigner, isComputing]);

  const computeMyPayout = useCallback((eventLoss: number) => {
    if (isRefreshingRef.current || isComputingRef.current) return;
    if (!shieldPool.address || !instance || !ethersSigner) return;
    if (eventLoss < 0) return;

    const thisChainId = chainId;
    const thisAddress = shieldPool.address;
    const thisSigner = ethersSigner;
    const contract = new ethers.Contract(thisAddress, shieldPool.abi, thisSigner);

    isComputingRef.current = true;
    setIsComputing(true);
    setMessage("Start computeMyPayout...");

    const run = async () => {
      const isStale = () =>
        thisAddress !== spRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisSigner);

      try {
        await new Promise((r) => setTimeout(r, 100));

        const input = instance.createEncryptedInput(thisAddress!, thisSigner.address);
        input.add32(eventLoss);
        const enc = await input.encrypt();

        if (isStale()) {
          setMessage("Ignore computeMyPayout");
          return;
        }

        setMessage("Call computeMyPayout...");
        const tx: ethers.TransactionResponse = await contract.computeMyPayout(
          enc.handles[0],
          enc.inputProof
        );
        setMessage(`Wait for tx:${tx.hash}...`);
        await tx.wait();
        setMessage("computeMyPayout completed");
        refreshAllHandles();
      } catch (e) {
        setMessage("computeMyPayout failed");
      } finally {
        isComputingRef.current = false;
        setIsComputing(false);
      }
    };

    run();
  }, [chainId, shieldPool.address, shieldPool.abi, instance, ethersSigner, sameChain, sameSigner, refreshAllHandles]);

  const authorizeViewer = useCallback(() => {
    if (!shieldPool.address || !ethersSigner) return;
    const contract = new ethers.Contract(shieldPool.address, shieldPool.abi, ethersSigner);
    contract.authorizeViewer().then(() => setMessage("Authorized viewer for aggregates")).catch(() => setMessage("authorizeViewer failed"));
  }, [shieldPool.address, shieldPool.abi, ethersSigner]);

  return {
    contractAddress: shieldPool.address,
    isDeployed,
    message,
    handles,
    clears,
    canView,
    canDecrypt,
    decryptAll,
    refreshAllHandles,
    canJoin,
    joinPool,
    canCompute,
    computeMyPayout,
    authorizeViewer,
    isRefreshing,
    isDecrypting,
    isJoining,
    isComputing,
  };
};


