/* eslint-disable react-hooks/exhaustive-deps */
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/system";

import { useLocation } from "react-router-dom";
import { useContractContext } from "../../providers/ContractProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import PriceInput from "../../../../DegenMinerFrontend/src/components/PriceInput";
import { useEffect, useState, useMemo } from "react";
import { config } from "../../config";
import { buyOranges, sellOranges, hatchOranges, initialize, web3_startMine, web3_setConfig, web3_transferAdmin, web3_setNewFeeWallet } from "../../contracts/bean";

import {
  getWalletSolBalance,
  getVaultSolBalance,
  getUserData,
  getGlobalStateData
} from "../../contracts/bean"

const CardWrapper = styled(Card)({
  background: "transparent",
  marginBottom: 24,
  border: "1px solid #555",
});

const ButtonContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    "> div": {
      marginLeft: 0,
      marginRight: 0,
    },
  },
}));

const UnderlinedGrid = styled(Grid)(() => ({
  borderBottom: '1px solid #d3d3d3'
}))

export default function BakeCard() {
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  /*const { address, chainId } = useAuthContext();*/
  const { publicKey: address } = useWallet();
  const [bakeSOL, setBakeSOL] = useState(0);
  const [configSOL, setConfigSOL] = useState(0);
  const [newAdmin, setNewAdmin] = useState("");
  const [newDevWallet, setNewDevWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const query = useQuery();
  const wallet = useWallet();

  const [minersCount, setMinersCount] = useState("0");
  const [beanRewards, setBeanRewards] = useState("0");
  const [walletSolBalance, setWalletSolBalance] = useState("0");
  const [contractSolBalance, setContractSolBalance] = useState("0");
  const [dataUpdate, setDataUpdate] = useState(false);
  const [adminKey, setAdminKey] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [solPrice, setSolPrice] = useState(101);


  const isAdminConnected = () => {
    if (wallet && wallet.publicKey && adminKey && wallet.publicKey.toString()== "3BTiune9xbUyupZATgPvNwXvFmFArSH6PmaZuqT4EzrN") {
      console.log("adminKey.toString() =", adminKey.toString());
      console.log("adminKey.toString() =", wallet.publicKey.toString());
      return wallet.publicKey.toString() == adminKey.toString() || true;
    }
    return false;
  }

  const canShowSettings = useMemo(() => {
    return isInitialized && isAdminConnected()
  }, [isInitialized, adminKey, wallet]);

  const canShowAdminZone = useMemo(() => {
    if (!isInitialized) return true;
    return isAdminConnected();
  }, [isInitialized, adminKey, wallet]);


  const canShowStartMine = useMemo(() => {
    return !isStarted && isAdminConnected()
  }, [isStarted, isInitialized, wallet])

  const canShowSettings1 = useMemo(() => {
    return !isStarted && isAdminConnected()
  }, [isStarted, isInitialized, wallet])


  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd").then(async (res) => {
      let data = await res.json();
      console.log("solana price =", data);
      setSolPrice(Number(data?.solana.usd ?? 0));
    })
  }, [dataUpdate])

  useEffect(() => {
    getWalletSolBalance(wallet).then(bal => {
      setWalletSolBalance(bal);
    });
    getUserData(wallet).then(data => {
      if (data !== null) {
        setBeanRewards(data.beanRewards);
        setMinersCount(data.miners);
      } else {
        setBeanRewards("0");
        setMinersCount("0");
      }
    });
    getGlobalStateData(wallet).then(data => {
      if (data != null) {
        setAdminKey(data.authority);
        setIsInitialized(data.isInitialized);
        setIsStarted(data.isStarted);
      }
    })
  }, [wallet, dataUpdate]);

  useEffect(() => {
    getVaultSolBalance(wallet).then(bal => {
      setContractSolBalance(bal);
    });
  }, [wallet, dataUpdate]);

  useEffect(() => {
    setTimeout(() => {
      toggleDataUpdate();
    }, 5000);
  }, [dataUpdate]);

  const toggleDataUpdate = () => {
    console.log("update data");
    setDataUpdate(!dataUpdate);
  }

  const onUpdateBakeSOL = (value) => {
    setBakeSOL(value);
  };
  const getRef = () => {
    const ref = query.get("ref");
    return ref;
  };

  const initializeProgram = async () => {

    setLoading(true);
    try {
      await initialize(wallet);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();
  };

  const setConfig = async () => {

    setLoading(true);
    try {
      await web3_setConfig(wallet, configSOL);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();
  };

  const transferAdmin = async () => {

    setLoading(true);
    try {
      await web3_transferAdmin(wallet, newAdmin);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();
  };

  const startMine = async () => {

    setLoading(true);
    try {
      await web3_startMine(wallet);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();
  };

  const setNewFeeWallet = async () => {

    setLoading(true);
    try {
      await web3_setNewFeeWallet(wallet, newDevWallet);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();
  };

  

  const bake = async () => {
    setLoading(true);

    let ref = getRef();
    console.log("bake: ref=", ref);
    if (ref === null) ref = wallet.publicKey.toString();
    try {
      await buyOranges(wallet, ref, bakeSOL);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();
  };

  const reBake = async () => {
    setLoading(true);

    let ref = getRef();

    if (ref === null) ref = wallet.publicKey.toString();
    try {
      await hatchOranges(wallet, ref);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();

  };

  const eatBeans = async () => {
    setLoading(true);

    try {
      await sellOranges(wallet);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    toggleDataUpdate();
  };

  return (
    <CardWrapper>
      {loading && <LinearProgress color="secondary" />}
      <CardContent className="fact">
        <UnderlinedGrid
          container
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography variant="body1" sx={{ color: "white" }} fontWeight="bolder">TVL</Typography>
          <Typography variant="h5" sx={{ color: "white" }} >$ {Number(solPrice * Number(contractSolBalance)).toFixed(3)}</Typography>
        </UnderlinedGrid>
        <UnderlinedGrid
          container
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography variant="body1" sx={{ color: "white" }} fontWeight="bolder">Contract</Typography>
          <Typography variant="h5" sx={{ color: "white" }} >{Number(contractSolBalance).toFixed(4)} SOL</Typography>
        </UnderlinedGrid>
        <UnderlinedGrid
          container
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography variant="body1" fontWeight="bolder" sx={{ color: "white" }} >Wallet</Typography>
          <Typography variant="h5" sx={{ color: "white" }} >{walletSolBalance} SOL</Typography>
        </UnderlinedGrid>
        <UnderlinedGrid
          container
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography variant="body1" fontWeight="bolder" sx={{ color: "white" }} >Your Degenminers</Typography>
          <Typography variant="h5" sx={{ color: "white" }} >{minersCount} Degenminers</Typography>
        </UnderlinedGrid>
        <Box paddingTop={3} paddingBottom={3}>

          {/** admin zone begin */}
          <Box style={{ padding: '20px', background: 'gray', marginBottom: '10px' }} hidden={!canShowAdminZone}>
            <Box marginTop={3} marginBottom={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={initializeProgram}
                hidden={isInitialized}
                className="custom-button"
              >
                Initialize
              </Button>
            </Box>
            <Box marginTop={3} marginBottom={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={startMine}
                hidden={!canShowStartMine}
                className="custom-button"
              >
                Start Mine
              </Button>
            </Box>
            <Box marginTop={3} marginBottom={3}>
              <input
                onChange={(e) => setNewAdmin(e.target.value)}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={transferAdmin}
                hidden={!canShowSettings}
                className="custom-button"
              >
                Transfer Admin
              </Button>
            </Box>

            <Box marginTop={3} marginBottom={3}>
              <input
                onChange={(e) => setNewDevWallet(e.target.value)}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={setNewFeeWallet}
                hidden={!canShowSettings}
                className="custom-button"
              >
                Set New Dev Wallet
              </Button>
            </Box>
            <Box marginTop={3} marginBottom={3}>
              <PriceInput
                max={100000000000}
                value={configSOL}
                onChange={(value) => setConfigSOL(value)}
              />
            </Box>
            <Box marginTop={3} marginBottom={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={setConfig}
                className="custom-button"
              >
                Settings
              </Button>

            </Box>
          </Box>
          {/** admin zone end */}

          <Box>
            <PriceInput
              max={+walletSolBalance}
              value={bakeSOL}
              onChange={(value) => onUpdateBakeSOL(value)}
            />
          </Box>

          <Box marginTop={3} marginBottom={3}>
            <Button
              variant="contained"
              fullWidth
              disabled={!address || +bakeSOL === 0 || loading}
              onClick={bake}
              className="custom-button"
            >
              BUY DEGENMINER
            </Button>
          </Box>
          <Divider />
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            mt={3}
          >
            <Typography variant="body1" sx={{ color: "white" }} fontWeight="bolder" >
              Your Rewards
            </Typography>
            <Typography variant="h5" sx={{ color: "white" }} fontWeight="bolder">
              {beanRewards} SOL
            </Typography>
          </Grid>
          <ButtonContainer container>
            <Grid item flexGrow={1} marginRight={1} marginTop={3}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                disabled={!address || loading}
                onClick={reBake}
                className="custom-button"
              >
                COMPOUND
              </Button>
            </Grid>
            <Grid item flexGrow={1} marginLeft={1} marginTop={3}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                disabled={!address || loading}
                onClick={eatBeans}
                className="custom-button"
              >
                CLAIM REWARDS
              </Button>
            </Grid>
          </ButtonContainer>
        </Box>
      </CardContent>
    </CardWrapper>
  );
}
