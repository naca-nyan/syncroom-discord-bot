export type User = {
  userId: string;
  nickname: string;
  nsmgMemberId: string;
  iconInfo: Record<string, string>;
  favorite: boolean;
};

export type Room = {
  realm: number;
  index: number;
  roomAttribute: Record<string, string>;
  roomName: string;
  roomDesc: string;
  needPasswd: boolean;
  creator: User;
  members: User[];
  numMembers: number;
  tagMask: string;
  tagOrig: string;
  createTime: string;
};

export type RoomList = {
  rooms: Room[];
  totalPublishedRooms: number;
  totalUnpublishedRooms: number;
};

const URL =
  "https://webapi.syncroom.appservice.yamaha.com/comm/public/room_list";
export async function get_room_list(): Promise<RoomList> {
  const res = await fetch(URL);
  const data = await res.json();
  return data;
}

export async function get_online_members(): Promise<string> {
  const data = await get_room_list();
  const users = data.rooms.flatMap((r) => r.members);
  const list = users.map((u) => "- " + u.nickname).join("\n");
  return `現在ルームにいる人一覧です\n${list}`;
}

export async function get_room_by_nickname(nickname: string): Promise<string> {
  const data = await get_room_list();
  const room = data.rooms.find((r) =>
    r.members.some((m) => m.nickname == nickname)
  );
  if (room === undefined) {
    return `${nickname} さんはどの部屋にもいませんでした`;
  }
  const roominfo =
    `ルーム名: ${room.roomName}\n` +
    `ルーム説明: ${room.roomDesc || "ルームの説明がありません。"}\n` +
    `メンバー:\n` +
    room.members.map((u) => "- " + u.nickname).join("\n");

  return `${nickname} さんはいまここにいます \n${roominfo}`;
}

if (import.meta.main) {
  const m = await get_online_members();
  console.log(m);
}
