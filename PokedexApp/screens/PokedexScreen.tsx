import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getPokemons, getPokemonDetails } from '../services/api';
import { Pokemon } from '../types/Pokemon';
import { PokemonCard } from '../components/PokemonCard';

export const PokedexScreen = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const LIMIT = 30;

  useEffect(() => {
  const fetchData = async () => {
    try {
      const list = await getPokemons(LIMIT, offset);
      const details = await Promise.all(list.map(p => getPokemonDetails(p.url)));
      setPokemons(prev => [...prev, ...details]);
    } catch (err) {
      setErro('Falha ao carregar Pokémons. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [offset]);

  const loadMorePokemons = () => {
    if (isLoadingMore || isLoading) return; // Evita chamadas múltiplas
    setIsLoadingMore(true);
    setOffset(prev => prev + LIMIT);
    setIsLoadingMore(false);
  };


  const filtered = pokemons.filter(p =>
    p.name.includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#888" />
        <Text style={styles.loadingText}>Carregando Pokémons...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>
      <TextInput
        placeholder="Buscar pokémon..."
        style={styles.input}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => <PokemonCard pokemon={item} />}
        onEndReached={loadMorePokemons}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search
              ? `Nenhum Pokémon encontrado para '${search}'`
              : 'Nenhum Pokémon para exibir no momento.'}
          </Text>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" color="gray" style={{ marginVertical: 20 }} />
          ) : null
        }
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  emptyText: {
  textAlign: 'center',
  fontSize: 16,
  color: '#555',
  marginTop: 20,
},
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  input: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});
