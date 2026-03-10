import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RegisteredToastProps {
  visible: boolean;
  onHide?: () => void;
  message?: string;
}

export const RegisteredToast: React.FC<RegisteredToastProps> = ({
  visible,
  onHide,
  message = "You're registered!",
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        scale.setValue(0);
        onHide?.();
      });
    }, 2200);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.popup,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={36} color="#10b981" />
        </View>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    marginBottom: 12,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});
