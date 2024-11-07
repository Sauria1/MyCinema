import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen({ user, handleAuthentication }) {
  return (
    <View style={styles.container}>
      <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sapien nulla, ornare a nibh a, finibus rhoncus lorem. Nam elementum aliquet nulla eget laoreet. In fringilla imperdiet sapien. Sed eleifend, nunc ac feugiat porta, tellus ante interdum neque, eu volutpat elit nulla eget dui. Mauris ac diam in lacus consectetur mattis in nec diam. Fusce faucibus aliquam sagittis. Nunc laoreet a urna ac pharetra. Quisque ut dui rhoncus, varius purus sit amet, elementum tellus. Ut vulputate, est quis feugiat ultrices, quam arcu finibus turpis, hendrerit sagittis orci leo et magna. Quisque tellus augue, sodales at tincidunt sit amet, dignissim eget urna. Mauris suscipit erat sollicitudin ligula tempus pulvinar.</Text>
      <View style={styles.signOutContainer}>
        <Text style={styles.userText}>Welcome, {user.email}</Text>
        <TouchableOpacity style={styles.button} onPress={handleAuthentication}>
          <Text style={styles.buttonText}>Kirjaudu ulos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  userText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
