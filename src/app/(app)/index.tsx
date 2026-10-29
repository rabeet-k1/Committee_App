import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPkr, frequencyLabel } from "@/lib/format";
import type { CommitteeListItem } from "@/lib/types";
import { Button, Card, ErrorText, Muted, StatusBadge } from "@/ui/kit";
import { useTheme } from "@/ui/theme";
import { Stack, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function CommitteesScreen() {
  const { user, logout } = useAuth();
  const t = useTheme();
  const [items, setItems] = useState<CommitteeListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api<CommitteeListItem[]>("/committees"));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  // reload whenever this screen comes back into view (after creating or joining)
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => void logout()} hitSlop={10}>
              <Text style={{ color: t.brand, fontWeight: "600" }}>
                Sign out
              </Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={items ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Text style={{ color: t.text, fontSize: 22, fontWeight: "700" }}>
              Hi, {user?.name}
            </Text>
            <Button
              title="Create a committee"
              onPress={() => router.push("/create")}
            />
            <Button
              title="Join with invite code"
              variant="outline"
              onPress={() => router.push("/join")}
            />
            <ErrorText>{error}</ErrorText>
          </View>
        }
        ListEmptyComponent={
          items === null && !error ? (
            <ActivityIndicator style={{ marginTop: 32 }} />
          ) : items ? (
            <View style={{ marginTop: 32, alignItems: "center" }}>
              <Muted>
                You are not in any committee yet. Create one or join with a
                code.
              </Muted>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/committee/[id]",
                params: { id: item.id },
              })
            }
          >
            <Card>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: t.text,
                    fontSize: 17,
                    fontWeight: "700",
                    flexShrink: 1,
                  }}
                >
                  {item.name}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Muted>
                {formatPkr(item.contributionPkr)}{" "}
                {frequencyLabel(item.frequency)}
              </Muted>
              <Muted>
                {item._count.members} of {item.totalMembers} members
              </Muted>
            </Card>
          </Pressable>
        )}
      />
    </>
  );
}
