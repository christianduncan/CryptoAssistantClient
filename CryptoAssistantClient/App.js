import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import axios from 'axios'
import Voice from 'react-native-voice'
import Tts from 'react-native-tts'

const _backendEndpoint = "https://api.us-south.assistant.watson.cloud.ibm.com/instances/decd008e-9256-4cbe-9d58-1887d34c183f/v1/workspaces/922209c9-b279-4597-aa58-f5b7fca61ea2/message"

const App: () => React$Node = () => {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [userPayload, setUserPayload] = useState('');
  const [userSession, setUserSession] = useState('');

  Voice.onSpeechStart = this.onSpeechStartHandler;
  Voice.onSpeechEnd = this.onSpeechEndHandler;
  Voice.onSpeechResults = this.onSpeechResultsHandler;

  useEffect(() => this.getSession());

  /**
   * Get Watson session
   */
  getSession = async () => {
    const response = await axios.get(
      `${_backendEndpoint}/api/session`,
      userPayload,
    );
    this.init(response.data);
  };

  /**
   * Greeting when assistant is ready
   */
  init = async (session) => {
    try {
      const initialPayload = {
        input: {
          message_type: 'text',
          text: '',
        },
      };
      let response = await axios.post(`${_backendEndpoint}/api/message`, {
        ...initialPayload,
        ...session,
      });
      Tts.speak(response.data.output.generic[0].text);

      // deve responder aqui
      setUserSession(session);
      setText(response.data.output.generic[0].text);
      setUserPayload(response.data);
    } catch (err) {
      console.log('Failed to retrive data from Watson API', err);
    }
  };

  // Handle voice capture event
  onSpeechResultsHandler = (result) => {
    setText(result.value[0]);
    this.sendMessage(result.value[0]);
  };

  // Listening to start
  onSpeechStartHandler = () => {
    setStatus('Listening...');
  };

  // Listening to end
  onSpeechEndHandler = () => {
    setStatus('Voice Processed');
  };

  // Listening to press button to speak
  onStartButtonPress = (e) => {
    Voice.start();
  };

  // Listening to release button to speak
  onStopButtonPress = (e) => {
    Voice.stop();
    Tts.stop();
  };

  /**
   * send message to Watson
   */
  sendMessage = async (payload) => {
    try {
      let {userSession} = this.state;
      let inputPayload = {
        input: {
          message_type: 'text',
          text: payload,
        },
      };

      let responseData = {...inputPayload, ...userSession};
      let response = await axios.post(
        `${_backendEndpoint}/api/message`,
        responseData,
      );
      setText(response.data.output.generic[0].text)
      Tts.speak(response.data.output.generic[0].text);
    } catch (err) {
      console.log('Failed to send data to Watson API', err);
    }
  };

  
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Header />
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Step One</Text>
              <Text style={styles.sectionDescription}>
                Edit <Text style={styles.highlight}>App.js</Text> to change this
                screen and then come back to see your edits.
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>See Your Changes</Text>
              <Text style={styles.sectionDescription}>
                <ReloadInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Debug</Text>
              <Text style={styles.sectionDescription}>
                <DebugInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Learn More</Text>
              <Text style={styles.sectionDescription}>
                Read the docs to discover what to do next:
              </Text>
            </View>
            <LearnMoreLinks />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
