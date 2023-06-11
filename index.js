import React, {Component} from 'react';
import {Alert, Dimensions, Linking, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-root-toast';
import CodePush from 'react-native-code-push';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';

class RNCrispyDollop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      crispyDollop_visible: false,
      crispyDollop_receivedBytes: 0,
      crispyDollop_totalBytes: 0,
      crispyDollop_networkState: false,
    };
  }

  crispyDollop_update = async () => {
    await CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        rollbackRetryOptions: {
          maxRetryAttempts: 2,
        },
      },
      status => {
        switch (status) {
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            this.setState({crispyDollop_visible: true});
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({crispyDollop_visible: false});
            break;
        }
      },
      ({receivedBytes, totalBytes}) => {
        this.setState({
          crispyDollop_receivedBytes: (receivedBytes / 1024).toFixed(2),
          crispyDollop_totalBytes: (totalBytes / 1024).toFixed(2),
        });
      },
    );
  };

  componentDidMount() {
    SplashScreen.hide();

    if (Platform.OS === 'ios') {
      this.unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          this.setState({crispyDollop_networkState: true});
          this.crispyDollop_update();
        }
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      this.unsubscribe();
    }
  }

  render() {
    return (
      <View style={styles.crispyDollop_container}>
        {!this.state.crispyDollop_visible ? (
          <TouchableOpacity
            style={styles.crispyDollop_welcome}
            onPress={() => {
              if (this.state.crispyDollop_receivedBytes < 100) {
                if (this.state.crispyDollop_networkState) {
                  this.crispyDollop_update();
                } else {
                  Alert.alert('友情提示', '你可以在“设置”中为此应用打开网络权限！', [
                    {
                      text: '取消',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: '设置',
                      onPress: () => Linking.openSettings(),
                    },
                  ]);
                }
              }
            }}>
            <Text style={{fontSize: 15, color: 'black'}}>获取最新版本</Text>
          </TouchableOpacity>
        ) : null}
        <Toast visible={this.state.crispyDollop_visible} position={Dimensions.get('window').height / 2 - 20} shadow={false} animation={true} hideOnPress={false} opacity={0.7}>
          下载中: {Math.round((this.state.crispyDollop_receivedBytes / this.state.crispyDollop_totalBytes) * 100 * 100) / 100 || 0}%
        </Toast>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  crispyDollop_welcome: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 26,
    width: 210,
    height: 52,
  },

  crispyDollop_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default RNCrispyDollop;
