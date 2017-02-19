export default function publish(channel) {
  return (request) => {
    request.once('data', (data) => {
      channel.publish(data);      
    });
  };
}
