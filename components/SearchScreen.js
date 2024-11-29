import React, {useState} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    TouchableWithoutFeedback,
    Keyboard,
    Modal,
    Button,
} from 'react-native';
import {getDatabase, ref, set} from 'firebase/database';
import app from '../firebaseConfig';

export default function SearchScreen() {
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const fetchMovies = async () => {
        if (!searchQuery) {
            setError('Syötä arvo');
            setMovieData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://www.omdbapi.com/?t=${searchQuery}&apikey=92a2de3a`
            );
            const data = await response.json();

            if (data.Response === 'True') {
                setMovieData(data);
            } else {
                setError('Valitettavasti elokuvaa ei löytynyt annetulla haulla.');
                setMovieData(null);
            }
        } catch (err) {
            setError('Tietojen hakeminen epäonnistui');
            setMovieData(null);
        } finally {
            setLoading(false);
        }
    };

    const saveMovieToDatabase = (movie, status) => {
        setMovieData(null);
        setSearchQuery('');

        const db = getDatabase(app);
        const movieId = movie.imdbID;
        const movieRef = ref(db, `movies/${status}/` + movieId);

        set(movieRef, {
            title: movie.Title,
            year: movie.Year,
            plot: movie.Plot,
            poster: movie.Poster,
            imdbID: movie.imdbID,
        })
            .then(() => {
                alert(`Elokuva on tallennettu!`);
            })
            .catch((error) => {
                console.error('Virhe elokuvan tallentamisessa:', error);
                alert('Tallentaminen epäonnistui');
            });
    };

    const handleSearchQueryChange = (newQuery) => {
        setSearchQuery(newQuery);
        setMovieData(null);
        setError(null);
    };

    const handleShowDetails = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Syötä elokuvan nimi"
                    value={searchQuery}
                    onChangeText={handleSearchQueryChange}
                />
                <TouchableOpacity style={styles.searchButton} onPress={fetchMovies}>
                    <Text style={styles.searchButtonText}>Hae</Text>
                </TouchableOpacity>
                {loading && <ActivityIndicator size="large" color="#0000ff"/>}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {movieData ? (
                    <View style={styles.resultContainer}>
                        {movieData.Poster && movieData.Poster !== 'N/A' && (
                            <Image
                                source={{uri: movieData.Poster}}
                                style={styles.poster}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={styles.movieTitle}>{movieData.Title}</Text>

                        <TouchableOpacity onPress={handleShowDetails}>
                            <Text style={styles.detailsButton}>Näytä tarkemmat tiedot</Text>
                        </TouchableOpacity>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => saveMovieToDatabase(movieData, 'wantToWatch')}
                            >
                                <Text style={styles.actionButtonText}>Haluan katsoa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={handleCloseModal}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.sectionTitle}>Kuvaus:</Text>
                            <Text style={styles.plotText}>
                                {movieData && movieData.Plot ? movieData.Plot : 'Ei kuvausta saatavilla'}
                            </Text>
                            <Text style={styles.sectionTitle}>Näyttelijät:</Text>
                            <Text style={styles.actorsText}>
                                {movieData && movieData.Actors ? movieData.Actors : 'Ei näyttelijöitä saatavilla'}
                            </Text>
                            <Button title="Sulje" onPress={handleCloseModal}/>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        width: '90%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
        borderRadius: 5,
    },
    searchButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
    },
    searchButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '90%',
    },
    poster: {
        width: '100%',
        height: 300,
        marginBottom: 20,
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 20,
    },
    actionButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    detailsButton: {
        color: '#007BFF',
        fontSize: 16,
        marginTop: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    plotText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 10,
    },
    actorsText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
});