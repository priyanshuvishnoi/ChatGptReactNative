import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const TypingIndicator = () => {
  const dot1 = new Animated.Value(0);
  const dot2 = new Animated.Value(0);
  const dot3 = new Animated.Value(0);

  const animateDots = (dot: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  React.useEffect(() => {
    animateDots(dot1, 0);
    animateDots(dot2, 150);
    animateDots(dot3, 300);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Assistant is typing</Text>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    marginRight: 10,
    color: '#555',
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    marginHorizontal: 2,
    borderRadius: 3,
    backgroundColor: '#555',
  },
});

export default TypingIndicator;
