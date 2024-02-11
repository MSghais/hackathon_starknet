import { Box, Card, Text, Button, CardFooter, Input } from "@chakra-ui/react";
import { LaunchInterface, LaunchCardView } from "../../../types";
import {
  Uint256,
  cairo,
  shortString,
  stark,
  validateAndParseAddress,
} from "starknet";
import { feltToAddress, feltToString } from "../../../utils/starknet";
import { useAccount } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { formatDateTime, formatRelativeTime } from "../../../utils/format";
import { BiCheck, BiCheckShield } from "react-icons/bi";
import {
  ExternalStylizedButtonLink,
  ExternalTransparentButtonLink,
} from "../../../components/button/NavItem";
import { CONFIG_WEBSITE } from "../../../constants";
import { buy_token } from "../../../hooks/launch/buy_token";
import { cancel_launch } from "../../../hooks/launch/cancel_launch";
import { withdraw_token } from "../../../hooks/launch/withdraw_token";

interface ILaunchPageView {
  launch?: LaunchInterface;
  viewType?: LaunchCardView;
  id?: number;
}

/** @TODO get component view ui with call claim reward for recipient visibile */
export const LaunchPageView = ({ launch, viewType, id }: ILaunchPageView) => {
  const startDateBn = Number(launch.start_date.toString());
  const startDate = new Date(startDateBn);

  const endDateBn = Number(launch.end_date.toString());
  const endDate = new Date(endDateBn);
  const account = useAccount().account;
  const address = account?.address;

  const [withdrawTo, setWithdrawTo] = useState<string | undefined>(address);
  const [amountToBuy, setAmountToBuy] = useState<Uint256 | undefined>(
    cairo.uint256(0)
  );
  useEffect(() => {
    const updateWithdrawTo = () => {
      if (!withdrawTo && address) {
        setWithdrawTo(address);
      }
    };
    updateWithdrawTo();
  }, [address]);

  const owner = feltToAddress(BigInt(launch?.owner?.toString()));
  function timeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  }
  let total_amount = launch?.amounts?.deposited;
  return (
    <>
      <Card
        textAlign={"left"}
        maxW={{ base: "100%" }}
        py={{ base: "0.5em" }}
        p={{ base: "1.5em", md: "1.5em" }}
        maxWidth={{ lg: "750px" }}
        rounded={"1em"}
        overflow={"hidden"}
        // justifyContent={"space-between"}
        height={"100%"}
      >
        {/* <Text>Start Date: {startDate?.toString()}</Text> */}

        <Text>Asset: {feltToAddress(BigInt(launch.asset.toString()))}</Text>

        <Box 
        display={{ md: "flex" }}
        >
          <Box>
            <Text>Start Date: {formatDateTime(startDate)}</Text>
            <Text>End Date: {timeAgo(endDate)}</Text>
            <Text>End Date: {formatDateTime(endDate)}</Text>
          </Box>

          <Box>
            {launch?.was_canceled && (
              <Box display={"flex"} gap="1em" alignItems={"baseline"}>
                Cancel <BiCheck color="red"></BiCheck>
              </Box>
            )}

            {launch?.is_depleted && (
              <Box display={"flex"} gap="1em" alignItems={"baseline"}>
                Depleted <BiCheckShield></BiCheckShield>
              </Box>
            )}

            {launch?.amounts?.withdrawn && (
              <Box display={"flex"} gap="1em" alignItems={"baseline"}>
                Withdraw <BiCheck></BiCheck>
                <Box>{launch?.amounts?.withdrawn.toString()}</Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* {launch?.id && (
          <Box>
            launch id:{" "}
            {shortString.decodeShortString(launch?.launch_id.toString())}
          </Box>
        )} */}

        <Box>
          <ExternalStylizedButtonLink
            // pb={{ base: "0.5em" }}
            textOverflow={"no"}
            maxW={{ md: "170px" }}
            href={`${CONFIG_WEBSITE.page.goerli_voyager_explorer}/contract/${owner}`}
          >
            {/* <Text>{senderAddress}</Text> */}
            <Text>Owner explorer</Text>
          </ExternalStylizedButtonLink>
        </Box>

        <Box>
          <Text>Amount: {Number(total_amount) / 10 ** 18}</Text>

          <Box display={{ base: "flex" }} gap={{ base: "0.5em" }}>
            {launch?.amounts?.refunded && (
              <Text>
                Refunded {Number(launch.amounts?.refunded) / 10 ** 18}
              </Text>
            )}
            {launch?.amounts?.withdrawn && (
              <Text>
                Withdraw {Number(launch.amounts?.withdrawn) / 10 ** 18}
              </Text>
            )}
          </Box>
        </Box>

        <Box
          gap="1em"
          justifyContent={"start"}
          // justifyContent={"space-around"}
          justifyItems={"left"}
          justifySelf={"self-start"}
          display={{ md: "grid" }}
        >
          {amountToBuy && Number(amountToBuy) > 0 && (
            <Text>Amount to buy: {Number(amountToBuy)}</Text>
          )}
          <Input
            py={{ base: "0.5em" }}
            type="number"
            my={{ base: "0.25em", md: "0.5em" }}
            maxW={"fit-content"}
            onChange={(e) => {
              let str = String(Number(e?.target?.value) * 10 ** 18);
              setAmountToBuy(cairo.uint256(parseInt(str)));

              // setAmountToBuy(cairo.uint256(parseInt(Number(e?.target?.value) * 10**18 )));
            }}
            placeholder="Amount to buy"
          ></Input>

          <Button
            onClick={() =>
              buy_token(
                account,
                launch?.launch_id ?? id,
                amountToBuy,
                feltToAddress(BigInt(launch?.asset))
              )
            }
          >
            Buy token
          </Button>
        </Box>
        <CardFooter
          textAlign={"left"}
          justifyContent={"start"}
          px={{ base: "0.25em" }}
          py={{ base: "0.25em" }}
        >
          <Box display={"grid"} justifyContent={"start"}>
            {owner == address && (
              <Box>
                <Button
                  onClick={() => cancel_launch(account, launch?.launch_id)}
                >
                  Cancel
                </Button>
              </Box>
            )}

            {owner != address && withdrawTo && !launch.was_canceled && (
              <Box>
                <Button
                  onClick={() =>
                    withdraw_token(account, launch?.launch_id ?? id)
                  }
                >
                  Withdraw max
                </Button>
              </Box>
            )}
          </Box>
        </CardFooter>
      </Card>
    </>
  );
};