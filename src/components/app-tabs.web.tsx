import { Tabs, TabList, TabTrigger } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      <TabList>
        <TabTrigger name="home" href="/" />
      </TabList>
    </Tabs>
  );
}
