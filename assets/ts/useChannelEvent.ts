import { Channel } from "phoenix";
import React from "react";

export const useChannelEvent = (
  channel: Channel | null,
  event: string,
  handler: (payload: unknown) => void
) => {
  React.useEffect(() => {
    if (channel) {
      const ref = channel.on(event, handler);
      return () => channel.off(event, ref);
    }
  }, [channel, event, handler]);
};
