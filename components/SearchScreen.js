import { StyleSheet, Text, View } from 'react-native';

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sapien nulla, ornare a nibh a, finibus rhoncus lorem. Nam elementum aliquet nulla eget laoreet. In fringilla imperdiet sapien. Sed eleifend, nunc ac feugiat porta, tellus ante interdum neque, eu volutpat elit nulla eget dui. Mauris ac diam in lacus consectetur mattis in nec diam. Fusce faucibus aliquam sagittis. Nunc laoreet a urna ac pharetra. Quisque ut dui rhoncus, varius purus sit amet, elementum tellus. Ut vulputate, est quis feugiat ultrices, quam arcu finibus turpis, hendrerit sagittis orci leo et magna. Quisque tellus augue, sodales at tincidunt sit amet, dignissim eget urna. Mauris suscipit erat sollicitudin ligula tempus pulvinar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontSize: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
