import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Image,
    Modal,
    Button,
} from 'react-native';
import {getDatabase, ref, onValue, update, remove} from 'firebase/database';
import app from '../firebaseConfig';

export default function HomeScreen({user, handleAuthentication}) {
    const [wantToWatchMovies, setWantToWatchMovies] = useState([]);
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [rating, setRating] = useState({});

    useEffect(() => {
        const db = getDatabase(app);
        const wantToWatchRef = ref(db, 'movies/wantToWatch/');

        onValue(wantToWatchRef, (snapshot) => {
            const data = snapshot.val();
            const moviesList = data ? Object.values(data) : [];
            setWantToWatchMovies(moviesList);
        });

        const watchedRef = ref(db, 'movies/watched/');
        onValue(watchedRef, (snapshot) => {
            const data = snapshot.val();
            const moviesList = data ? Object.values(data) : [];
            setWatchedMovies(moviesList);

            const ratings = {};
            moviesList.forEach((movie) => {
                ratings[movie.imdbID] = movie.rating || 0;
            });
            setRating(ratings);
        });
    }, []);

    const markAsWatched = (movie) => {
        const db = getDatabase(app);
        const wantToWatchRef = ref(db, `movies/wantToWatch/${movie.imdbID}`);
        const watchedRef = ref(db, `movies/watched/${movie.imdbID}`);

        const movieWithRating = {
            ...movie,
            rating: rating[movie.imdbID] || 0,
        };

        update(watchedRef, movieWithRating)
            .then(() => {
                remove(wantToWatchRef)
                    .then(() => {
                        alert('Elokuva merkitty katsotuksi!');
                        setSelectedMovie(null);
                    })
                    .catch((error) => {
                        console.error('Virhe poistaessa elokuvaa:', error);
                        alert('Elokuvan poisto epäonnistui');
                    });
            })
            .catch((error) => {
                console.error('Virhe elokuvan siirtämisessä katsotuksi:', error);
                alert('Elokuvan merkitseminen katsotuksi epäonnistui');
            });
    };

    const removeFromWantToWatch = (movie) => {
        const db = getDatabase(app);
        const wantToWatchRef = ref(db, `movies/wantToWatch/${movie.imdbID}`);

        setRating((prevState) => {
            const newState = {...prevState};
            delete newState[movie.imdbID];
            return newState;
        });

        remove(wantToWatchRef)
            .then(() => {
                alert('Elokuva poistettu "Haluan katsoa" -listalta!');
                setSelectedMovie(null);
            })
            .catch((error) => {
                console.error('Virhe poistaessa elokuvaa:', error);
                alert('Elokuvan poisto epäonnistui');
            });
    };

    const setMovieRating = (movie, ratingValue) => {
        const db = getDatabase(app);
        const movieRef = ref(
            db,
            `movies/${watchedMovies.some((m) => m.imdbID === movie.imdbID) ? 'watched' : 'wantToWatch'}/${movie.imdbID}`
        );

        update(movieRef, {
            rating: ratingValue,
        })
            .then(() => {
                setRating((prevState) => ({
                    ...prevState,
                    [movie.imdbID]: ratingValue,
                }));
                alert(`Arvio asetettu: ${ratingValue}`);
            })
            .catch((error) => {
                console.error('Virhe arvioinnissa:', error);
                alert('Arvion asettaminen epäonnistui');
            });
    };

    const handleLogout = () => {
        handleAuthentication(null);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Elokuvat, jotka pitää nähdä</Text>

            <FlatList
                data={wantToWatchMovies}
                keyExtractor={(item) => item.imdbID}
                renderItem={({item}) => (
                    <TouchableOpacity onPress={() => setSelectedMovie(item)}>
                        <View style={styles.cardContainer}>
                            {item.poster ? (
                                <Image source={{uri: item.poster}} style={styles.poster}/>
                            ) : (
                                <View style={styles.noPosterContainer}>
                                    <Text style={styles.noPosterText}>Ei julistetta</Text>
                                </View>
                            )}
                            <Text style={styles.movieTitle}>{item.title}</Text>
                            <Text style={styles.movieYear}>{item.year}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <Text style={styles.title}>Katsotut elokuvat</Text>

            <FlatList
                data={watchedMovies}
                keyExtractor={(item) => item.imdbID}
                renderItem={({item}) => (
                    <TouchableOpacity onPress={() => setSelectedMovie(item)}>
                        <View style={styles.cardContainer}>
                            {item.poster ? (
                                <Image source={{uri: item.poster}} style={styles.poster}/>
                            ) : (
                                <View style={styles.noPosterContainer}>
                                    <Text style={styles.noPosterText}>Ei julistetta</Text>
                                </View>
                            )}
                            <Text style={styles.movieTitle}>{item.title}</Text>
                            <Text style={styles.movieYear}>{item.year}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <Modal visible={!!selectedMovie} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedMovie && (
                            <>
                                <Image source={{uri: selectedMovie.poster}} style={styles.modalPoster}/>
                                <Text style={styles.modalTitle}>{selectedMovie.title}</Text>
                                <Text>{selectedMovie.plot}</Text>

                                {watchedMovies.some((movie) => movie.imdbID === selectedMovie.imdbID) ? (
                                    <View style={styles.ratingContainer}>
                                        <Text style={styles.ratingText}>Oma arvosana:</Text>
                                        <Text style={styles.currentRatingText}>
                                            {rating[selectedMovie.imdbID] || 'Ei arvosanaa'}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.ratingContainer}>
                                        <Text style={styles.ratingText}>Oma arvosana:</Text>
                                        <View style={styles.ratingButtons}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <TouchableOpacity
                                                    key={star}
                                                    style={[
                                                        styles.ratingButton,
                                                        rating[selectedMovie.imdbID] >= star
                                                            ? styles.selectedRatingButton
                                                            : {},
                                                    ]}
                                                    onPress={() => setMovieRating(selectedMovie, star)}
                                                >
                                                    <Text style={styles.ratingButtonText}>{star}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                <View style={styles.modalActions}>
                                    {!watchedMovies.some((movie) => movie.imdbID === selectedMovie.imdbID) && (
                                        <>
                                            <Button title="Merkitse katsotuksi"
                                                    onPress={() => markAsWatched(selectedMovie)}/>
                                            <Button
                                                title="Poista listalta"
                                                color="red"
                                                onPress={() => removeFromWantToWatch(selectedMovie)}
                                            />
                                        </>
                                    )}
                                </View>
                                <Button title="Sulje" onPress={() => setSelectedMovie(null)} color="gray"/>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <Button title="Kirjaudu ulos" onPress={handleLogout} color="blue" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        paddingTop: 20,
    },
    cardContainer: {
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        marginBottom: 20,
        padding: 10,
        alignItems: 'center',
        width: '48%',
    },
    poster: {
        width: 100,
        height: 150,
        borderRadius: 5,
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        textAlign: 'center',
    },
    movieYear: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    noPosterContainer: {
        width: 100,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    noPosterText: {
        fontSize: 16,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    modalPoster: {
        width: 200,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    ratingContainer: {
        marginBottom: 15,
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 18,
        marginBottom: 10,
    },
    ratingButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    ratingButton: {
        backgroundColor: '#ddd',
        padding: 10,
        margin: 2,
        borderRadius: 5,
    },
    selectedRatingButton: {
        backgroundColor: '#ffcc00',
    },
    ratingButtonText: {
        fontSize: 16,
        color: '#333',
    },
    modalActions: {
        marginBottom: 15,
        width: '100%',
    },
});