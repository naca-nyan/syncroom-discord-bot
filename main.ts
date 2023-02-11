import {
  ApplicationCommandOptionTypes,
  createBot,
  CreateApplicationCommand,
  Intents,
  InteractionResponseTypes,
  startBot,
} from "https://deno.land/x/discordeno@13.0.0/mod.ts";
import { get_online_members, get_room_by_nickname } from "./syncroom.ts";

const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN");
if (DISCORD_TOKEN === undefined) throw new Error("DISCORD_TOKEN not given");
const GUILD_ID = Deno.env.get("GUILD_ID");
if (GUILD_ID === undefined) throw new Error("GUILD_ID not given");

const bot = createBot({
  token: DISCORD_TOKEN,
  intents: Intents.Guilds | Intents.GuildMessages,
  events: {
    ready() {
      console.log("Successfully connected to gateway");
    },
  },
});

const guildId = BigInt(GUILD_ID);
const command: CreateApplicationCommand = {
  name: "sr",
  description: "SYNCROOM の状況取得するやつ",
  options: [
    {
      name: "nickname",
      type: ApplicationCommandOptionTypes.String,
      description: "検索するユーザー名",
    },
  ],
};
bot.helpers.createApplicationCommand(command, guildId);

bot.events.interactionCreate = async function (b, interaction) {
  console.log(interaction.user.username, interaction.data);
  if (interaction.data?.name === "sr") {
    const options = interaction.data?.options ?? [];
    const nickname = options.find((o) => o.name === "nickname")?.value;
    let msg;
    if (typeof nickname === "string") {
      msg = await get_room_by_nickname(nickname);
    } else {
      msg = await get_online_members();
    }
    await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: msg },
    });
  }
};

await startBot(bot);
