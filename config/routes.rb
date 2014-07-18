ActionController::Routing::Routes.draw do |map|
  map.connect 'my/card', :controller => 'my_card', :action => 'my_index'
end
